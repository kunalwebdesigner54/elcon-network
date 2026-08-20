const User = require('../models/User');
const Donation = require('../models/Donation');

const DONATION_AMOUNTS = Donation.DONATION_AMOUNTS;

// Generate a unique donation ID: DON + timestamp + 4-digit random
const generateDonationId = () => {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DON${ts}${rand}`;
};

const formatDate = (value) => {
  if (!value) return '---';
  return new Date(value).toLocaleDateString('en-GB');
};

/**
 * Helper to determine member's actual sequential unlocked level based on DB records.
 */
const getActualUnlockLevel = async (memberId) => {
  const approvedDonations = await Donation.find({
    fromMemberId: memberId,
    status: { $in: ['APPROVED', 'COMPLETED'] }
  });

  let currentUnlock = 0;
  for (let l = 1; l <= 10; l++) {
    if (approvedDonations.some(d => d.level === l)) {
      currentUnlock = l;
    } else {
      break; // Must be sequential
    }
  }
  return currentUnlock;
};

/**
 * Walk up the sponsor chain from startMemberId and return the first upline
 * who is actually eligible for the target level (has an APPROVED donation for it).
 * Circular protection via visited Set.
 *
 * If no eligible upline exists, returns null safely (no auto-admin assignment).
 */
const findEligibleUpline = async (startMemberId, targetLevel) => {
  const skipped = [];
  let currentMemberId = startMemberId;
  const MAX_DEPTH = 500; // Increased to allow deep traversal, protected by visited Set
  const visited = new Set();

  for (let depth = 0; depth < MAX_DEPTH; depth++) {
    if (visited.has(currentMemberId)) {
      break; // Circular reference detected
    }
    visited.add(currentMemberId);

    const currentUser = await User.findOne({ memberId: currentMemberId });
    if (!currentUser || !currentUser.sponsorId) break;

    const upline = await User.findOne({ memberId: currentUser.sponsorId });
    if (!upline) break;

    // Check actual DB eligibility
    let isEligible = false;
    if (upline.role === 'admin') {
      isEligible = true; // Admin is always eligible
    } else {
      const approvedDonation = await Donation.findOne({
        fromMemberId: upline.memberId,
        level: targetLevel,
        status: { $in: ['APPROVED', 'COMPLETED'] }
      });
      if (approvedDonation) {
        isEligible = true;
      }
    }

    if (isEligible) {
      return { upline, skipped };
    }

    skipped.push(upline.memberId);
    currentMemberId = upline.memberId;
  }

  // Safe fallback state as per business rules
  return { upline: null, skipped };
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

    const currentUnlock = await getActualUnlockLevel(user.memberId);

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
      return res.status(404).json({ success: false, message: 'No eligible receiver found. Admin review required.' });
    }

    res.status(200).json({
      success: true,
      data: {
        level,
        amount: DONATION_AMOUNTS[level],
        toMemberId: upline.memberId,
        toName: upline.name,
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

    const currentUnlock = await getActualUnlockLevel(user.memberId);

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

    // Find eligible upline
    const { upline, skipped } = await findEligibleUpline(user.memberId, targetLevel);
    if (!upline) {
      return res.status(500).json({ success: false, message: 'No eligible receiver found. Admin review required.' });
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
    // Cache unlock level
    user.unlockLevel = Math.max(user.unlockLevel || 1, targetLevel);
    await user.save();

    // Credit upline's wallet
    upline.walletBalance = (upline.walletBalance || 0) + amount;
    await upline.save();

    // Record the donation
    const now = new Date();
    const donation = await Donation.create({
      donationId,
      fromMemberId: user.memberId,
      fromName: user.name,
      toMemberId: upline.memberId,
      toName: upline.name,
      amount,
      level: targetLevel,
      status: 'APPROVED',
      donationDate: now,
      approvedAt: now,
      approvedBy: 'SYSTEM_WALLET',
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

    const currentUnlock = await getActualUnlockLevel(user.memberId);
    if (targetLevel !== currentUnlock + 1) {
      return res.status(400).json({
        success: false,
        message: `Levels must be upgraded sequentially. Your next level is ${currentUnlock + 1}.`,
      });
    }

    // Check for already-pending or waiting submission for this level
    const existing = await Donation.findOne({
      fromMemberId: user.memberId,
      level: targetLevel,
      status: { $in: ['PENDING', 'WAITING_FOR_RECEIVER_CONFIRMATION'] },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A submission for Level ${targetLevel} already exists (ID: ${existing.donationId}) and is ${existing.status.replace(/_/g, ' ')}.`,
      });
    }

    const { upline, skipped } = await findEligibleUpline(user.memberId, targetLevel);
    if (!upline) {
      return res.status(500).json({ success: false, message: 'No eligible receiver found. Admin review required.' });
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
      donationDate: new Date(), // Set actual submission date
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
// PATCH /api/donations/:donationId/status  — receiver/admin: approve / reject
// ─────────────────────────────────────────────────────────────────────────────
exports.updateDonationStatus = async (req, res) => {
  try {
    const { donationId } = req.params;
    const { status, remark } = req.body;

    if (!['APPROVED', 'REJECTED', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED' });
    }
    
    // Normalize COMPLETED to APPROVED safely
    const finalStatus = status === 'COMPLETED' ? 'APPROVED' : status;

    const donation = await Donation.findOne({ donationId });
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }
    
    // Idempotency / Double processing protection
    if (['APPROVED', 'COMPLETED'].includes(donation.status)) {
      return res.status(400).json({ success: false, message: `Donation is already approved.` });
    }
    
    // Must be coming from WAITING or PENDING state
    if (!['WAITING_FOR_RECEIVER_CONFIRMATION', 'PENDING'].includes(donation.status)) {
      return res.status(400).json({ success: false, message: `Donation is ${donation.status} and cannot be processed.` });
    }

    if (finalStatus === 'APPROVED') {
      const payer = await User.findOne({ memberId: donation.fromMemberId });
      const receiver = await User.findOne({ memberId: donation.toMemberId });

      if (payer && (payer.unlockLevel || 1) < donation.level) {
        payer.unlockLevel = donation.level; // purely a cache now, true rules rely on DB
        await payer.save();
      }
      if (receiver) {
        receiver.walletBalance = (receiver.walletBalance || 0) + donation.amount;
        await receiver.save();
      }
    }

    donation.status = finalStatus;
    donation.remark = remark || donation.remark;
    donation.approvedAt = new Date();
    donation.approvedBy = req.user.memberId || req.user.id;
    // preserve donation.donationDate explicitly
    await donation.save();

    res.status(200).json({
      success: true,
      message: `Donation ${finalStatus.toLowerCase()} successfully`,
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

    const sent = await Donation.find({ fromMemberId: memberId }).sort({ createdAt: -1 });
    const received = await Donation.find({ toMemberId: memberId }).sort({ createdAt: -1 });

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
      date: formatDate(d.donationDate || d.createdAt),
      dateRaw: d.donationDate || d.createdAt,
      utrNumber: d.utrNumber || '---',
      remark: d.remark || '---',
    });

    const sentRows = sent.map((d, i) => ({ ...mapRow(d, 'SENT'), sNo: i + 1 }));
    const receivedRows = received.map((d, i) => ({ ...mapRow(d, 'RECEIVED'), sNo: i + 1 }));

    const totalSent = sent.filter(d => ['APPROVED', 'COMPLETED'].includes(d.status)).reduce((s, d) => s + d.amount, 0);
    const totalReceived = received.filter(d => ['APPROVED', 'COMPLETED'].includes(d.status)).reduce((s, d) => s + d.amount, 0);

    // Provide the dynamic actual unlock level for UI progression mapping
    const currentUnlockLevel = await getActualUnlockLevel(memberId);

    res.status(200).json({
      success: true,
      data: {
        sent: sentRows,
        received: receivedRows,
        summary: {
          totalSent,
          totalReceived,
          netEarning: totalReceived - totalSent,
          currentUnlockLevel
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

    const donations = await Donation.find(filter).sort({ createdAt: -1 });

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
      date: formatDate(d.donationDate || d.createdAt),
      dateRaw: d.donationDate || d.createdAt,
      utrNumber: d.utrNumber || '---',
      remark: d.remark || '---',
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

    // Check user-specific pending and waiting counts correctly
    const pendingFilter = { status: 'PENDING' };
    const waitingFilter = { status: 'WAITING_FOR_RECEIVER_CONFIRMATION' };
    if (!isAdmin) {
      pendingFilter.$or = [{ fromMemberId: memberId }, { toMemberId: memberId }];
      waitingFilter.$or = [{ fromMemberId: memberId }, { toMemberId: memberId }];
    }

    const [completed, pending, waiting, byLevel] = await Promise.all([
      Donation.find(completedFilter),
      Donation.countDocuments(pendingFilter),
      Donation.countDocuments(waitingFilter),
      Donation.aggregate([
        { $match: { status: { $in: ['APPROVED', 'COMPLETED'] } } },
        { $group: { _id: '$level', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const startOfYesterday = new Date();
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(startOfYesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const yesterdayDonations = completed.filter(
      (d) => (d.approvedAt || d.createdAt) >= startOfYesterday && (d.approvedAt || d.createdAt) <= endOfYesterday
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
        waitingDonations: waiting,
        byLevel,
        ...userStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
