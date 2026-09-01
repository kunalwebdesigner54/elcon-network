const RepurchaseIncome = require('../models/RepurchaseIncome');
const User = require('../models/User');

exports.getRepurchaseIncomeReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, memberId, memberName, levelNo, startDate, endDate } = req.query;

    // Build filter query
    const query = {};

    // For User Panel, always filter by recipientMemberId if the user is not admin
    if (req.user && req.user.role !== 'admin') {
      query.recipientMemberId = req.user.memberId;
    } else if (memberId) {
      // For Admin Panel, filter by memberId if provided
      query.recipientMemberId = new RegExp(memberId.trim(), 'i');
    }

    if (memberName) {
      // We don't store recipient name directly in this table, but for UI we might need to join
      // We will skip name filtering here for simplicity unless we populate
    }

    if (levelNo) {
      query.level = Number(levelNo);
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Fetch data
    const total = await RepurchaseIncome.countDocuments(query);

    // Calculate global total
    const totalAmountAgg = await RepurchaseIncome.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const globalTotalAmount = totalAmountAgg.length > 0 ? totalAmountAgg[0].total : 0;

    const records = await RepurchaseIncome.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Fetch the names for recipient members
    const recipientMemberIds = [...new Set(records.map(r => r.recipientMemberId))];
    const users = await User.find({ memberId: { $in: recipientMemberIds } }, 'memberId name levelDepth sponsorId').lean();

    const userMap = {};
    const levelDepthMap = {};
    const directCountMap = {};
    users.forEach(u => {
      userMap[u.memberId] = u.name || '---';
      levelDepthMap[u.memberId] = u.levelDepth ?? 0;
    });

    if (recipientMemberIds.length) {
      const directCounts = await User.aggregate([
        { $match: { sponsorId: { $in: recipientMemberIds } } },
        { $group: { _id: '$sponsorId', directs: { $sum: 1 } } }
      ]);
      directCounts.forEach((item) => {
        directCountMap[item._id] = item.directs;
      });
    }

    const formattedData = records.map((record, index) => {
      const skippedIds = Array.isArray(record.skippedMembers) && record.skippedMembers.length > 0
        ? record.skippedMembers[0].memberId
        : '---';

      return {
        sNo: skip + index + 1,
        incomeDateTime: new Date(record.createdAt).toLocaleString('en-IN'),
        memberId: record.recipientMemberId,
        memberName: userMap[record.recipientMemberId] || '---',
        directs: directCountMap[record.recipientMemberId] || 0,
        levelDepth: levelDepthMap[record.recipientMemberId] || 0,
        levelNo: `Level ${record.level}`,
        levelId: record.purchasingMemberId,
        fromMemberName: record.purchasingMemberName,
        amount: record.amount,
        orderNo: record.orderNo,
        skippedIds: skippedIds
      };
    });

    res.status(200).json({
      success: true,
      data: formattedData,
      globalTotalAmount,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching repurchase income reports:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching repurchase income' });
  }
};
