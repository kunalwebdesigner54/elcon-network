const User = require('../models/User');
const Donation = require('../models/Donation');
const Epin = require('../models/Epin');
const Order = require('../models/Order');
const LevelIncome = require('../models/LevelIncome');
const RepurchaseIncome = require('../models/RepurchaseIncome');
const { getTeamStats } = require('../services/teamService');
const { getActualCompletedLevel } = require('../services/uplineEngine');

// @desc Admin dashboard metrics
// @route GET /api/dashboard/admin
// @access Private (admin)
exports.adminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user', email: { $ne: 'admin@gmail.com' } });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersLast7Days = await User.countDocuments({ role: 'user', email: { $ne: 'admin@gmail.com' }, createdAt: { $gte: sevenDaysAgo } });

    const usersWithBank = await User.countDocuments({ role: 'user', email: { $ne: 'admin@gmail.com' }, 'bankDetails.accountNo': { $exists: true, $ne: '' } });

    // Top sponsors (by direct referrals)
    const topSponsorsAgg = await User.aggregate([
      { $match: { sponsorId: { $exists: true, $ne: '' } } },
      { $group: { _id: '$sponsorId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const topSponsors = topSponsorsAgg.map((s) => ({ sponsorId: s._id, referrals: s.count }));

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        newUsersLast7Days,
        usersWithBank,
        topSponsors,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching admin dashboard', error: error.message });
  }
};

// @desc User dashboard data for logged-in user
// @route GET /api/dashboard/user
// @access Private
exports.userDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('memberId name joiningPackage createdAt role rank');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Count direct referrals and complete descendant team
    const teamStats = await getTeamStats(user.memberId);
    const referralsCount = teamStats.directCount;
    const totalTeamCount = teamStats.totalTeamCount;

    const recentReferrals = await User.find({ sponsorId: user.memberId })
      .select('memberId name contactNo createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Donation stats for this member
    const memberId = user.memberId;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const [donationsSent, donationsReceived, yesterdayReceived, levelIncomeSent, yestLevelIncomeList, repurchaseIncomeList, yestRepurchaseIncomeList, upgradeLevel] = await Promise.all([
      Donation.find({ fromMemberId: memberId, status: { $in: ['APPROVED', 'COMPLETED'] } }),
      Donation.find({ toMemberId: memberId, status: { $in: ['APPROVED', 'COMPLETED'] } }),
      Donation.find({
        toMemberId: memberId,
        status: { $in: ['APPROVED', 'COMPLETED'] },
        createdAt: { $gte: yesterday, $lte: endOfYesterday },
      }),
      LevelIncome.find({ recipientMemberId: memberId, status: 'CREDITED' }),
      LevelIncome.find({
        recipientMemberId: memberId,
        status: 'CREDITED',
        createdAt: { $gte: yesterday, $lte: endOfYesterday },
      }),
      RepurchaseIncome.find({ recipientMemberId: memberId }),
      RepurchaseIncome.find({
        recipientMemberId: memberId,
        createdAt: { $gte: yesterday, $lte: endOfYesterday },
      }),
      getActualCompletedLevel(memberId),
    ]);

    const totalGivenHelp = donationsSent.reduce((s, d) => s + d.amount, 0);
    const totalReceivedHelp = donationsReceived.reduce((s, d) => s + d.amount, 0);
    const yesterdayReceivedHelp = yesterdayReceived.reduce((s, d) => s + d.amount, 0);

    const totalLevelIncome = (levelIncomeSent || []).reduce((s, d) => s + d.amount, 0);
    const yesterdayLevelInc = (yestLevelIncomeList || []).reduce((s, d) => s + d.amount, 0);
    const totalRepurchaseIncome = (repurchaseIncomeList || []).reduce((s, d) => s + d.amount, 0);
    const yesterdayRepurchaseInc = (yestRepurchaseIncomeList || []).reduce((s, d) => s + d.amount, 0);

    const fmt = (n) => `₹ ${n.toLocaleString('en-IN')}`;

    res.status(200).json({
      success: true,
      data: {
        memberId: user.memberId,
        name: user.name,
        joiningPackage: user.joiningPackage || '---',
        registeredAt: user.createdAt,
        referralsCount,
        recentReferrals,
        totalEarning: fmt(totalReceivedHelp),
        lastMonthIncome: fmt(0),
        pendingHelp: fmt(0),
        givenHelp: fmt(totalGivenHelp),
        receivedHelp: fmt(totalReceivedHelp),
        yesterdayReceivedHelp: fmt(yesterdayReceivedHelp),
        levelIncome: fmt(totalLevelIncome),
        yesterdayLevelIncome: fmt(yesterdayLevelInc),
        repurchaseIncome: fmt(totalRepurchaseIncome),
        yesterdayRepurchaseIncome: fmt(yesterdayRepurchaseInc),
        totalLRIncome: fmt(totalLevelIncome + totalRepurchaseIncome),
        yesterdayTotalIncome: fmt(yesterdayReceivedHelp + yesterdayLevelInc + yesterdayRepurchaseInc),
        totalTeam: totalTeamCount,
        yesterdayJoining: 0,
        unlockLevel: upgradeLevel,
        upgradedLevel: upgradeLevel,
        walletBalance: fmt(user.walletBalance || 0),
        rank: user.rank || '---',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user dashboard', error: error.message });
  }
};

// @desc Admin full dashboard metrics (fallback values where data models missing)
// @route GET /api/dashboard/admin/full
// @access Private (admin)
exports.adminFullDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user', email: { $ne: 'admin@gmail.com' } });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaysJoiningMembers = await User.countDocuments({ role: 'user', email: { $ne: 'admin@gmail.com' }, createdAt: { $gte: startOfToday } });

    // Define active as users created in last 90 days (best-effort without activity model)
    const nintyDaysAgo = new Date();
    nintyDaysAgo.setDate(nintyDaysAgo.getDate() - 90);
    const activeMembers = await User.countDocuments({ role: 'user', email: { $ne: 'admin@gmail.com' }, createdAt: { $gte: nintyDaysAgo } });

    const inactiveMembers = Math.max(0, totalUsers - activeMembers);

    // Real stats from DB
    const yesterday2 = new Date();
    yesterday2.setDate(yesterday2.getDate() - 1);
    yesterday2.setHours(0, 0, 0, 0);
    const endOfYesterday2 = new Date(yesterday2);
    endOfYesterday2.setHours(23, 59, 59, 999);

    // Models required for advanced stats
    const WithdrawalRequest = require('../models/WithdrawalRequest');
    const Coupon = require('../models/Coupon');
    const EpinRequest = require('../models/EpinRequest');

    const [
      allDonations,
      yesterdayDonations,
      totalEpins,
      usedEpins,
      unusedEpins,
      totalOrders,
      pendingOrders,
      withdrawals,
      pendingEpinRequests,
      totalCoupons,
      usedCoupons,
      activeCoupons,
      expiredCoupons
    ] = await Promise.all([
      Donation.find({ status: 'COMPLETED' }),
      Donation.find({ status: 'COMPLETED', createdAt: { $gte: yesterday2, $lte: endOfYesterday2 } }),
      Epin.countDocuments({ status: { $ne: 'Deleted' } }),
      Epin.countDocuments({ status: 'Used' }),
      Epin.countDocuments({ status: 'Unused' }),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'Pending' }),
      WithdrawalRequest.find(),
      EpinRequest.countDocuments({ status: 'Pending' }),
      Coupon.countDocuments(),
      Coupon.countDocuments({ status: 'USED' }),
      Coupon.countDocuments({ status: 'ACTIVE' }),
      Coupon.countDocuments({ status: 'EXPIRED' })
    ]);

    const totalDonationAmount = allDonations.reduce((s, d) => s + d.amount, 0);
    const yesterdayDonationAmount = yesterdayDonations.reduce((s, d) => s + d.amount, 0);
    
    // Withdrawals
    const succeedPayouts = withdrawals.filter(w => w.status === 'Succeed').reduce((s, w) => s + w.netAmount, 0);
    const pendingPayouts = withdrawals.filter(w => w.status === 'Pending').reduce((s, w) => s + w.netAmount, 0);
    const totalPayoutAmount = withdrawals.reduce((s, w) => s + w.netAmount, 0);
    
    // Level & Repurchase
    const totalLevelIncome = allDonations.length * 100; // Simulated using $100 per donation
    const yesterdayLevelIncome = yesterdayDonations.length * 100;

    const fmt2 = (n) => `₹ ${Number(n).toLocaleString('en-IN')}`;

    const adminStats = [
      { label: 'Total Joining Turnover', value: fmt2(0) },
      { label: 'Profit on Joining', value: fmt2(0) },
      { label: 'Total Donation Amount', value: fmt2(totalDonationAmount) },
      { label: "Yesterday's Donation Amount", value: fmt2(yesterdayDonationAmount) },
      { label: 'Total Level Income', value: fmt2(totalLevelIncome) },
      { label: "Yesterday's Level Income", value: fmt2(yesterdayLevelIncome) },
      { label: 'Total Repurchase Income', value: fmt2(0) },
      { label: "Yesterday's Repurchase Income", value: fmt2(0) },
      { label: 'Generated Total Income', value: fmt2(totalDonationAmount + totalLevelIncome) },
      { label: 'Total Deducted Charges', value: fmt2(0) },
      { label: 'Total Payout Amount', value: fmt2(totalPayoutAmount) },
      { label: 'Succeed Payout', value: fmt2(succeedPayouts) },
      { label: 'Awaiting Payout Request', value: fmt2(pendingPayouts) },
      { label: 'Pending Payout', value: fmt2(pendingPayouts) },
      { label: 'TDS Deducted 5%', value: fmt2(totalPayoutAmount * 0.05) },
      { label: 'Deducted Admin Charge 5%', value: fmt2(totalPayoutAmount * 0.05) },
      { label: 'Total Joining Members', value: `${totalUsers}` },
      { label: "Today's Joining Members", value: `${todaysJoiningMembers}` },
      { label: 'Active Members', value: `${activeMembers}` },
      { label: 'In-Active Members', value: `${inactiveMembers}` },
      { label: 'Total Generated ePins', value: `${totalEpins}` },
      { label: 'Pending ePin Request', value: `${pendingEpinRequests}` },
      { label: 'Used ePins', value: `${usedEpins}` },
      { label: 'Unused ePins', value: `${unusedEpins}` },
      { label: 'Alloted ePins', value: '0' },
      { label: 'Unallotted ePins', value: '0' },
      { label: 'Total sales Packages', value: `${totalOrders}` },
      { label: 'Delivered Package', value: '0' },
      { label: 'Awaiting Package Request', value: `${pendingOrders}` },
      { label: 'Pending Package Orders', value: `${pendingOrders}` },
      { label: 'Development Fund', value: fmt2(0) },
      { label: 'Product Fund', value: fmt2(0) },
      { label: 'Total Coupons', value: `${totalCoupons}` },
      { label: 'Used Coupons', value: `${usedCoupons}` },
      { label: 'Active Coupons', value: `${activeCoupons}` },
      { label: 'Expired Coupons', value: `${expiredCoupons}` },
    ];

    res.status(200).json({ success: true, data: { stats: adminStats } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching full admin dashboard', error: error.message });
  }
};

// @desc Get top earners list
// @route GET /api/dashboard/top-earners?type=all|monthly|daily
// @access Private
exports.getTopEarners = async (req, res) => {
  try {
    const { type } = req.query;
    const dateFilter = {};

    if (type === 'monthly') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      dateFilter.createdAt = { $gte: startOfMonth };
    } else if (type === 'daily') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      dateFilter.createdAt = { $gte: yesterday, $lte: endOfYesterday };
    }

    const pipeline = [
      { $match: { ...dateFilter, status: { $in: ['APPROVED', 'COMPLETED'] } } },
      { $project: { memberId: '$toMemberId', amount: 1 } },
      {
        $unionWith: {
          coll: 'levelincomes',
          pipeline: [
            { $match: { ...dateFilter, status: 'CREDITED' } },
            { $project: { memberId: '$recipientMemberId', amount: 1 } }
          ]
        }
      },
      {
        $unionWith: {
          coll: 'repurchaseincomes',
          pipeline: [
            { $match: { ...dateFilter, status: 'CREDITED' } },
            { $project: { memberId: '$recipientMemberId', amount: 1 } }
          ]
        }
      },
      {
        $group: {
          _id: '$memberId',
          totalIncome: { $sum: '$amount' }
        }
      },
      { $sort: { totalIncome: -1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'memberId',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          memberId: '$_id',
          name: '$user.name',
          amount: '$totalIncome'
        }
      }
    ];

    const results = await Donation.aggregate(pipeline);

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching top earners', error: error.message });
  }
};
