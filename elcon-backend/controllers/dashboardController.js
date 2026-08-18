const User = require('../models/User');
const Donation = require('../models/Donation');
const Epin = require('../models/Epin');
const Order = require('../models/Order');

// @desc Admin dashboard metrics
// @route GET /api/dashboard/admin
// @access Private (admin)
exports.adminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersLast7Days = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    const usersWithBank = await User.countDocuments({ 'bankDetails.accountNo': { $exists: true, $ne: '' } });

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

    // Count direct referrals
    const referralsCount = await User.countDocuments({ sponsorId: user.memberId });

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

    const [donationsSent, donationsReceived, yesterdayReceived] = await Promise.all([
      Donation.find({ fromMemberId: memberId, status: 'COMPLETED' }),
      Donation.find({ toMemberId: memberId, status: 'COMPLETED' }),
      Donation.find({
        toMemberId: memberId,
        status: 'COMPLETED',
        createdAt: { $gte: yesterday, $lte: endOfYesterday },
      }),
    ]);

    const totalGivenHelp = donationsSent.reduce((s, d) => s + d.amount, 0);
    const totalReceivedHelp = donationsReceived.reduce((s, d) => s + d.amount, 0);
    const yesterdayReceivedHelp = yesterdayReceived.reduce((s, d) => s + d.amount, 0);

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
        levelIncome: fmt(0),
        yesterdayLevelIncome: fmt(0),
        repurchaseIncome: fmt(0),
        yesterdayRepurchaseIncome: fmt(0),
        totalLRIncome: fmt(0),
        yesterdayTotalIncome: fmt(yesterdayReceivedHelp),
        totalTeam: referralsCount,
        yesterdayJoining: 0,
        unlockLevel: user.unlockLevel || 1,
        upgradedLevel: user.unlockLevel || 1,
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
    const totalUsers = await User.countDocuments();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaysJoiningMembers = await User.countDocuments({ createdAt: { $gte: startOfToday } });

    // Define active as users created in last 90 days (best-effort without activity model)
    const nintyDaysAgo = new Date();
    nintyDaysAgo.setDate(nintyDaysAgo.getDate() - 90);
    const activeMembers = await User.countDocuments({ createdAt: { $gte: nintyDaysAgo } });

    const inactiveMembers = Math.max(0, totalUsers - activeMembers);

    // Real stats from DB
    const yesterday2 = new Date();
    yesterday2.setDate(yesterday2.getDate() - 1);
    yesterday2.setHours(0, 0, 0, 0);
    const endOfYesterday2 = new Date(yesterday2);
    endOfYesterday2.setHours(23, 59, 59, 999);

    const [
      allDonations,
      yesterdayDonations,
      totalEpins,
      usedEpins,
      unusedEpins,
      totalOrders,
    ] = await Promise.all([
      Donation.find({ status: 'COMPLETED' }),
      Donation.find({ status: 'COMPLETED', createdAt: { $gte: yesterday2, $lte: endOfYesterday2 } }),
      Epin.countDocuments({ status: { $ne: 'Deleted' } }),
      Epin.countDocuments({ status: 'Used' }),
      Epin.countDocuments({ status: 'Unused' }),
      Order.countDocuments(),
    ]);

    const totalDonationAmount = allDonations.reduce((s, d) => s + d.amount, 0);
    const yesterdayDonationAmount = yesterdayDonations.reduce((s, d) => s + d.amount, 0);
    const fmt2 = (n) => `₹ ${Number(n).toLocaleString('en-IN')}`;

    const adminStats = [
      { label: 'Total Joining Turnover', value: fmt2(0) },
      { label: 'Profit on Joining', value: fmt2(0) },
      { label: 'Total Donation Amount', value: fmt2(totalDonationAmount) },
      { label: "Yesterday's Donation Amount", value: fmt2(yesterdayDonationAmount) },
      { label: 'Total Level Income', value: fmt2(0) },
      { label: "Yesterday's Level Income", value: fmt2(0) },
      { label: 'Total Repurchase Income', value: fmt2(0) },
      { label: "Yesterday's Repurchase Income", value: fmt2(0) },
      { label: 'Generated Total Income', value: fmt2(totalDonationAmount) },
      { label: 'Total Deducted Charges', value: fmt2(0) },
      { label: 'Total Payout Amount', value: fmt2(0) },
      { label: 'Succeed Payout', value: fmt2(0) },
      { label: 'Awaiting Payout Request', value: fmt2(0) },
      { label: 'Pending Payout', value: fmt2(0) },
      { label: 'TDS Deducted 5%', value: fmt2(0) },
      { label: 'Deducted Admin Charge 5%', value: fmt2(0) },
      { label: 'Total Joining Members', value: `${totalUsers}` },
      { label: "Today's Joining Members", value: `${todaysJoiningMembers}` },
      { label: 'Active Members', value: `${activeMembers}` },
      { label: 'In-Active Members', value: `${inactiveMembers}` },
      { label: 'Total Generated ePins', value: `${totalEpins}` },
      { label: 'Pending ePin Request', value: '0' },
      { label: 'Used ePins', value: `${usedEpins}` },
      { label: 'Unused ePins', value: `${unusedEpins}` },
      { label: 'Alloted ePins', value: '0' },
      { label: 'Unallotted ePins', value: '0' },
      { label: 'Total sales Packages', value: `${totalOrders}` },
      { label: 'Delivered Package', value: '0' },
      { label: 'Awaiting Package Request', value: '0' },
      { label: 'Pending Package Orders', value: '0' },
      { label: 'Development Fund', value: fmt2(0) },
      { label: 'Product Fund', value: fmt2(0) },
      { label: 'Total Coupons', value: '0' },
      { label: 'Used Coupons', value: '0' },
      { label: 'Active Coupons', value: '0' },
      { label: 'Expired Coupons', value: '0' },
    ];

    res.status(200).json({ success: true, data: { stats: adminStats } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching full admin dashboard', error: error.message });
  }
};
