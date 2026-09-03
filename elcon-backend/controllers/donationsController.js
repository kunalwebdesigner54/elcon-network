const User = require('../models/User');
const Donation = require('../models/Donation');
const { createWalletTransaction } = require('../utils/walletHelper');

const DONATION_AMOUNTS = Donation.DONATION_AMOUNTS;

// Generate a unique donation ID: DON + timestamp + 4-digit random
const generateDonationId = () => {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DON${ts}${rand}`;
};

const { formatDate, formatDateOnly } = require('../utils/dateFormatter');

const { getLogicalUplines, getActualCompletedLevel } = require('../services/uplineEngine');

/**
 * Uses the Central Upline Engine to find the single eligible receiver for the targetLevel donation.
 * It builds logical levels up to targetLevel and returns the member that successfully claims the targetLevel slot.
 */
const findEligibleUpline = async (startMemberId, targetLevel) => {
  // We need to calculate logical levels up to targetLevel.
  // Example: if targetLevel is 3, we traverse finding Logical 1, Logical 2, and Logical 3.
  // The person who gets Logical 3 is our intended upline.
  const { receivers, skipped } = await getLogicalUplines(startMemberId, targetLevel, 'DONATION', 1);
  
  // The target receiver is the one who qualified for targetLevel
  const targetReceiver = receivers.find(r => r.logicalLevel === targetLevel);
  
  let upline = null;
  if (targetReceiver) {
    upline = targetReceiver.member;
  } else {
    // Fall back to admin if the chain ended before finding someone for targetLevel
    upline = await User.findOne({ role: 'admin' }).select('memberId role name contactNo paymentDetails bankDetails').lean();
  }
  
  return { upline, skipped };
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/donations/target/:level  — who should this user pay?
// ─────────────────────────────────────────────────────────────────────────────
exports.getDonationTarget = async (req, res) => {
  try {
    const level = parseInt(req.params.level, 10);
    if (!DONATION_AMOUNTS[level]) {
      return res.status(400).json({ success: false, message: 'Invalid donation level (1–10)' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const currentUnlock = await getActualCompletedLevel(user.memberId);
    if (level !== currentUnlock + 1) {
      return res.status(400).json({
        success: false,
        message: `You must upgrade levels sequentially. Next level: ${currentUnlock + 1}`,
      });
    }
    if (level > 10) {
      return res.status(400).json({ success: false, message: 'Already at maximum level' });
    }

    const { upline, skipped } = await findEligibleUpline(user.memberId, level);

    if (!upline) {
      return res.status(404).json({ success: false, message: 'No eligible upline found' });
    }

    res.status(200).json({
      success: true,
      data: {
        level,
        amount: DONATION_AMOUNTS[level],
        toMemberId: upline.memberId,
        toName: upline.name,
        toPhone: upline.contactNo || '',
        toPaymentDetails: upline.paymentDetails || {},
        toBankDetails: upline.bankDetails || {},
        skippedMembers: skipped,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/donations/upgrade  — wallet-based upgrade (auto-confirmed)
// ─────────────────────────────────────────────────────────────────────────────
exports.upgradeMember = async (req, res) => {
  try {
    const { level } = req.body;
    const targetLevel = parseInt(level, 10);

    if (!DONATION_AMOUNTS[targetLevel]) {
      return res.status(400).json({ success: false, message: 'Invalid donation level (1–10)' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const currentUnlock = await getActualCompletedLevel(user.memberId);

    // Must upgrade sequentially
    if (targetLevel !== currentUnlock + 1) {
      return res.status(400).json({
        success: false,
        message: `Levels must be upgraded sequentially. Your next level is ${currentUnlock + 1}.`,
      });
    }

    const amount = DONATION_AMOUNTS[targetLevel];

    // Check wallet balance
    if ((user.walletBalance || 0) < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Required: ₹${amount.toLocaleString('en-IN')}, Available: ₹${(user.walletBalance || 0).toLocaleString('en-IN')}`,
      });
    }

    // Find eligible upline (skip rule)
    const { upline, skipped } = await findEligibleUpline(user.memberId, targetLevel);
    if (!upline) {
      return res.status(500).json({ success: false, message: 'No eligible upline found to receive donation' });
    }

    // Generate unique donation ID
    let donationId = generateDonationId();
    let attempt = 0;
    while (await Donation.findOne({ donationId }) && attempt < 5) {
      donationId = generateDonationId();
      attempt++;
    }

    // Deduct from payer's wallet
    user.walletBalance = (user.walletBalance || 0) - amount;
    user.unlockLevel = targetLevel;
    
    if (targetLevel === 1 && !user.receivedWelcomeCoupon) {
      user.couponWalletBalance = (user.couponWalletBalance || 0) + 1000;
      user.receivedWelcomeCoupon = true;
    }
    
    await user.save();

    await createWalletTransaction({
      memberId: user.memberId,
      description: `DONATION DEBIT - Level ${targetLevel}`,
      debit: amount,
    });

    // Credit upline's wallet
    upline.walletBalance = (upline.walletBalance || 0) + amount;
    await upline.save();

    await createWalletTransaction({
      memberId: upline.memberId,
      description: `DONATION CREDIT - Level ${targetLevel}`,
      credit: amount,
    });

    // Record the donation
    const donation = await Donation.create({
      donationId,
      fromMemberId: user.memberId,
      fromName: user.name,
      toMemberId: upline.memberId,
      toName: upline.name,
      amount,
      level: targetLevel,
      status: 'APPROVED',
      skippedMembers: skipped,
    });

    res.status(201).json({
      success: true,
      message: `Successfully upgraded to Level ${targetLevel}. ₹${amount.toLocaleString('en-IN')} donated to ${upline.name} (${upline.memberId}).`,
      data: {
        donationId: donation.donationId,
        level: targetLevel,
        amount,
        toMemberId: upline.memberId,
        toName: upline.name,
        skippedMembers: skipped,
        newWalletBalance: user.walletBalance,
        newUnlockLevel: user.unlockLevel,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/donations/submit  — P2P direct-payment submission (pending approval)
// ─────────────────────────────────────────────────────────────────────────────
exports.submitDonation = async (req, res) => {
  try {
    const { level, utrNumber, paymentProof, remark } = req.body;
    const targetLevel = parseInt(level, 10);

    if (!DONATION_AMOUNTS[targetLevel]) {
      return res.status(400).json({ success: false, message: 'Invalid donation level (1–10)' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const currentUnlock = await getActualCompletedLevel(user.memberId);
    if (targetLevel !== currentUnlock + 1) {
      return res.status(400).json({
        success: false,
        message: `Levels must be upgraded sequentially. Your next level is ${currentUnlock + 1}.`,
      });
    }

    // Check for already-pending submission for this level
    const existing = await Donation.findOne({
      fromMemberId: user.memberId,
      level: targetLevel,
      status: { $in: ['PENDING', 'WAITING_FOR_RECEIVER_CONFIRMATION'] },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A pending donation submission for Level ${targetLevel} already exists (ID: ${existing.donationId}).`,
      });
    }

    const { upline, skipped } = await findEligibleUpline(user.memberId, targetLevel);
    if (!upline) {
      return res.status(500).json({ success: false, message: 'No eligible upline found' });
    }

    let donationId = generateDonationId();
    let attempt = 0;
    while (await Donation.findOne({ donationId }) && attempt < 5) {
      donationId = generateDonationId();
      attempt++;
    }

    const donation = await Donation.create({
      donationId,
      fromMemberId: user.memberId,
      fromName: user.name,
      toMemberId: upline.memberId,
      toName: upline.name,
      amount: DONATION_AMOUNTS[targetLevel],
      level: targetLevel,
      status: 'WAITING_FOR_RECEIVER_CONFIRMATION',
      utrNumber: utrNumber || '',
      paymentProof: paymentProof || '',
      remark: remark || '',
      skippedMembers: skipped,
    });

    res.status(201).json({
      success: true,
      message: `Donation submission for Level ${targetLevel} created. Awaiting confirmation.`,
      data: {
        donationId: donation.donationId,
        level: targetLevel,
        amount: DONATION_AMOUNTS[targetLevel],
        toMemberId: upline.memberId,
        toName: upline.name,
        status: 'WAITING_FOR_RECEIVER_CONFIRMATION',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/donations/:donationId/status  — admin: approve / reject
// ─────────────────────────────────────────────────────────────────────────────
exports.updateDonationStatus = async (req, res) => {
  try {
    const { donationId } = req.params;
    const { status, remark } = req.body;

    if (!['APPROVED', 'COMPLETED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED' });
    }

    const donation = await Donation.findOne({ donationId });
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (req.user.role !== 'admin' && req.user.memberId !== donation.toMemberId) {
      return res.status(403).json({ success: false, message: 'Not authorized to approve this donation' });
    }
    if (!['PENDING', 'WAITING_FOR_RECEIVER_CONFIRMATION'].includes(donation.status)) {
      return res.status(400).json({ success: false, message: `Donation is already ${donation.status}` });
    }

    if (status === 'APPROVED' || status === 'COMPLETED') {
      const payer = await User.findOne({ memberId: donation.fromMemberId });
      const receiver = await User.findOne({ memberId: donation.toMemberId });

      if (payer && payer.unlockLevel < donation.level) {
        payer.unlockLevel = donation.level; // Still updating this as a cache/fallback
        if (donation.level === 1 && !payer.receivedWelcomeCoupon) {
          payer.couponWalletBalance = (payer.couponWalletBalance || 0) + 1000;
          payer.receivedWelcomeCoupon = true;
        }
        await payer.save();
      }
      if (receiver) {
        receiver.walletBalance = (receiver.walletBalance || 0) + donation.amount;
        await receiver.save();

        await createWalletTransaction({
          memberId: receiver.memberId,
          description: `DONATION CREDIT - ${donation.donationId}`,
          credit: donation.amount,
        });
      }
    }

    donation.status = status;
    donation.remark = remark || donation.remark;
    donation.reviewedBy = req.user.id;
    donation.reviewedAt = new Date();
    await donation.save();

    res.status(200).json({
      success: true,
      message: `Donation ${status.toLowerCase()} successfully`,
      data: donation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/donations/my  — logged-in user's donation history
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyDonations = async (req, res) => {
  try {
    const memberId = req.user.memberId;

    const sent = await Donation.find({ fromMemberId: memberId }).sort({ createdAt: -1 }).lean();
    const received = await Donation.find({ toMemberId: memberId }).sort({ createdAt: -1 }).lean();

    const uniqueMemberIds = [...new Set([...sent.map(d => d.fromMemberId), ...received.map(d => d.fromMemberId)])];
    const User = require('../models/User');
    const directCounts = await User.aggregate([
      { $match: { sponsorId: { $in: uniqueMemberIds } } },
      { $group: { _id: '$sponsorId', count: { $sum: 1 } } }
    ]);
    const directsMap = {};
    directCounts.forEach(c => { directsMap[c._id] = c.count; });

    const mapRow = (d, type) => ({
      sNo: 0,
      donationId: d.donationId,
      type,
      level: d.level,
      amount: d.amount,
      fromMemberId: d.fromMemberId,
      fromName: d.fromName,
      toMemberId: d.toMemberId,
      toName: d.toName,
      status: d.status,
      skippedMembers: d.skippedMembers || [],
      date: formatDate(d.createdAt),
      dateRaw: d.createdAt,
      utrNumber: d.utrNumber || '---',
      remark: d.remark || '---',
      directs: directsMap[d.fromMemberId] || 0,
    });

    const sentRows = sent.map((d, i) => ({ ...mapRow(d, 'SENT'), sNo: i + 1 }));
    const receivedRows = received.map((d, i) => ({ ...mapRow(d, 'RECEIVED'), sNo: i + 1 }));

    const totalSent = sent.filter(d => ['APPROVED', 'COMPLETED'].includes(d.status)).reduce((s, d) => s + d.amount, 0);
    const totalReceived = received.filter(d => ['APPROVED', 'COMPLETED'].includes(d.status)).reduce((s, d) => s + d.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        sent: sentRows,
        received: receivedRows,
        summary: {
          totalSent,
          totalReceived,
          netEarning: totalReceived - totalSent,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/donations  — admin: all donations with optional filters
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllDonations = async (req, res) => {
  try {
    const { status, level, memberId } = req.query;
    const filter = {};
    if (status) filter.status = status.toUpperCase();
    if (level) filter.level = parseInt(level, 10);
    if (memberId) {
      const id = memberId.toUpperCase();
      filter.$or = [{ fromMemberId: id }, { toMemberId: id }];
    }

    const donations = await Donation.find(filter).sort({ createdAt: -1 }).lean();

    const uniqueMemberIds = [...new Set(donations.map(d => d.fromMemberId))];
    const User = require('../models/User');

    // Get directs
    const directCounts = await User.aggregate([
      { $match: { sponsorId: { $in: uniqueMemberIds } } },
      { $group: { _id: '$sponsorId', count: { $sum: 1 } } }
    ]);
    const directsMap = {};
    directCounts.forEach(c => { directsMap[c._id] = c.count; });

    // Get levelDepth
    const users = await User.find({ memberId: { $in: uniqueMemberIds } }).select('memberId levelDepth').lean();
    const levelDepthMap = {};
    users.forEach(u => { levelDepthMap[u.memberId] = u.levelDepth || 0; });

    const rows = donations.map((d, index) => ({
      sNo: index + 1,
      donationId: d.donationId,
      level: d.level,
      amount: d.amount,
      fromMemberId: d.fromMemberId,
      fromName: d.fromName,
      toMemberId: d.toMemberId,
      toName: d.toName,
      status: d.status,
      skippedMembers: d.skippedMembers || [],
      date: formatDate(d.createdAt),
      dateRaw: d.createdAt,
      reviewedAt: d.reviewedAt || null,
      utrNumber: d.utrNumber || '---',
      remark: d.remark || '---',
      directs: directsMap[d.fromMemberId] || 0,
      levelDepth: levelDepthMap[d.fromMemberId] || 0,
    }));

    const totalAmount = donations.filter(d => ['APPROVED', 'COMPLETED'].includes(d.status)).reduce((s, d) => s + d.amount, 0);

    res.status(200).json({
      success: true,
      total: donations.length,
      totalAmount,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/donations/stats  — aggregate stats for dashboards
// ─────────────────────────────────────────────────────────────────────────────
exports.getDonationStats = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const memberId = req.user.memberId;

    const completedFilter = { status: { $in: ['APPROVED', 'COMPLETED'] } };
    if (!isAdmin) {
      completedFilter.$or = [{ fromMemberId: memberId }, { toMemberId: memberId }];
    }

    const [completed, pending, byLevel] = await Promise.all([
      Donation.find(completedFilter).lean(),
      Donation.countDocuments({ status: { $in: ['PENDING', 'WAITING_FOR_RECEIVER_CONFIRMATION'] } }),
      Donation.aggregate([
        { $match: { status: { $in: ['APPROVED', 'COMPLETED'] } } },
        { $group: { _id: '$level', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Yesterday boundary
    const startOfYesterday = new Date();
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(startOfYesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const yesterdayDonations = completed.filter(
      (d) => d.createdAt >= startOfYesterday && d.createdAt <= endOfYesterday
    );

    const totalDonationAmount = completed.reduce((s, d) => s + d.amount, 0);
    const yesterdayDonationAmount = yesterdayDonations.reduce((s, d) => s + d.amount, 0);

    let userStats = {};
    if (!isAdmin) {
      const userSent = completed.filter(d => d.fromMemberId === memberId);
      const userReceived = completed.filter(d => d.toMemberId === memberId);
      userStats = {
        totalSent: userSent.reduce((s, d) => s + d.amount, 0),
        totalReceived: userReceived.reduce((s, d) => s + d.amount, 0),
      };
    }

    res.status(200).json({
      success: true,
      data: {
        totalDonations: completed.length,
        totalDonationAmount,
        yesterdayDonationAmount,
        pendingDonations: pending,
        byLevel,
        ...userStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyStatus = async (req, res) => {
  try {
    const memberId = req.user.memberId;
    const currentUnlock = await getActualCompletedLevel(memberId);
    const activeDonation = await Donation.findOne({
      fromMemberId: memberId,
      status: { $in: ['PENDING', 'WAITING_FOR_RECEIVER_CONFIRMATION'] }
    }).lean();
    res.status(200).json({
      success: true,
      data: {
        currentLevel: currentUnlock,
        nextLevel: currentUnlock + 1,
        amount: DONATION_AMOUNTS[currentUnlock + 1] || 0,
        activeDonation: activeDonation || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
