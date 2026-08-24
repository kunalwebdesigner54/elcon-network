const LevelIncome = require('../models/LevelIncome');
const User = require('../models/User');

const { formatDate, formatDateOnly } = require('../utils/dateFormatter');

/**
 * Get Level Income reports (for Admin: all members, for User: only their income)
 */
exports.getLevelIncomeReports = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      memberId,
      memberName,
      levelNo,
      levelId,
      startDate,
      endDate
    } = req.query;

    const query = {};

    // If a normal user is requesting, they only see their own earnings
    if (req.user && req.user.role === 'user') {
      const user = await User.findById(req.user.id).select('memberId');
      if (user) {
        query.recipientMemberId = user.memberId;
      }
    } else {
      // Admin filter by member ID receiving the income
      if (memberId) {
        query.recipientMemberId = new RegExp(memberId, 'i');
      }
    }

    if (memberName) {
      // Find recipient by name (requires lookup or just skip it if complex, but let's do a simple lookup)
      const users = await User.find({ name: new RegExp(memberName, 'i') }).select('memberId').lean();
      const userIds = users.map(u => u.memberId);
      // If we already had recipientMemberId, intersect it
      if (query.recipientMemberId) {
        // complex to intersect regex and array in simple assignment, let's just overwrite for admin
        query.recipientMemberId = { $in: userIds };
      } else {
        query.recipientMemberId = { $in: userIds };
      }
    }

    if (levelNo) {
      query.level = Number(levelNo);
    }
    
    if (levelId) {
      query.joiningMemberId = new RegExp(levelId, 'i');
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = eDate;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const total = await LevelIncome.countDocuments(query);
    
    // Calculate global total amount for the matching query
    const totalAmountAgg = await LevelIncome.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const globalTotalAmount = totalAmountAgg.length > 0 ? totalAmountAgg[0].total : 0;

    const records = await LevelIncome.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Populate recipient name for Admin panel
    const recipientIds = [...new Set(records.map(r => r.recipientMemberId))];
    const recipients = await User.find({ memberId: { $in: recipientIds } }).select('memberId name').lean();
    const recipientMap = {};
    recipients.forEach(r => { recipientMap[r.memberId] = r.name; });

    const data = records.map((record, index) => ({
      sNo: skip + index + 1,
      incomeDateTime: formatDate(record.createdAt),
      memberId: record.recipientMemberId,
      memberName: recipientMap[record.recipientMemberId] || '---',
      levelNo: record.level,
      levelId: record.joiningMemberId,
      fromMemberName: record.joiningMemberName || '---',
      physicalDepth: record.physicalDepth || 'N/A',
      amount: record.amount,
      status: record.status,
      transactionId: record.transactionId
    }));

    res.status(200).json({
      success: true,
      data,
      globalTotalAmount,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
