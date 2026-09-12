const User = require('../models/User');
const Donation = require('../models/Donation');
const LevelIncome = require('../models/LevelIncome');
const RepurchaseIncome = require('../models/RepurchaseIncome');
const SiteSetting = require('../models/SiteSetting');
const Order = require('../models/Order');
const Product = require('../models/Product');
const {
  buildReferralGraph,
  collectDescendants,
  getTeamStats,
  getAllUsersTeamStats,
  calculateLevelDepths
} = require('../services/teamService');

const { formatDate, formatDateOnly } = require('../utils/dateFormatter');

const stateCodeToName = {
  'AP': 'Andhra Pradesh', 'AR': 'Arunachal Pradesh', 'AS': 'Assam', 'BR': 'Bihar',
  'CG': 'Chhattisgarh', 'GA': 'Goa', 'GJ': 'Gujarat', 'HR': 'Haryana', 'HP': 'Himachal Pradesh',
  'JH': 'Jharkhand', 'KA': 'Karnataka', 'KL': 'Kerala', 'MP': 'Madhya Pradesh', 'MH': 'Maharashtra',
  'MN': 'Manipur', 'ML': 'Meghalaya', 'MZ': 'Mizoram', 'NL': 'Nagaland', 'OD': 'Odisha',
  'PB': 'Punjab', 'RJ': 'Rajasthan', 'SK': 'Sikkim', 'TN': 'Tamil Nadu', 'TG': 'Telangana',
  'TR': 'Tripura', 'UP': 'Uttar Pradesh', 'UK': 'Uttarakhand', 'WB': 'West Bengal',
  'AN': 'Andaman and Nicobar Islands', 'CH': 'Chandigarh', 'DN': 'Dadra and Nagar Haveli and Daman and Diu',
  'DL': 'Delhi', 'JK': 'Jammu and Kashmir', 'LA': 'Ladakh', 'LD': 'Lakshadweep', 'PY': 'Puducherry'
};

const getFullStateName = (code) => {
  if (!code || code === '---') return '---';
  return stateCodeToName[code.toUpperCase()] || code;
};


const getKycSnapshot = (user) => ({
  sNo: 0,
  status: user.kycStatus === 'REJECTED' ? 'REJECT' : (user.kycStatus || 'PENDING'),
  memberId: user.memberId || '---',
  name: user.name || '---',
  mobile: user.contactNo || '---',
  googlePay: user.kycDetails?.googlePayNumber || user.paymentDetails?.googlePay || '---',
  phonePe: user.kycDetails?.phonePeNumber || user.paymentDetails?.phonePe || '---',
  upiId: user.kycDetails?.upiId || user.paymentDetails?.upiId || '---',
  panNo: user.kycDetails?.panNo || user.panNo || '---',
  adharNo: user.kycDetails?.aadharCardNumber || user.aadharNo || '---',
  accountHolder: user.kycDetails?.accountHolderName || user.bankDetails?.holderName || '---',
  accountNo: user.kycDetails?.bankAccountNumber || user.bankDetails?.accountNo || '---',
  bankName: user.kycDetails?.bankName || user.bankDetails?.bankName || '---',
  branch: user.kycDetails?.bankBranch || user.bankDetails?.bankBranch || '---',
  ifscCode: user.kycDetails?.ifscCode || user.bankDetails?.ifsc || '---',
  aadharFrontImage: user.kycDetails?.aadharFrontImage || null,
  aadharBackImage: user.kycDetails?.aadharBackImage || null,
  createdAt: user.createdAt,
});

exports.getAdminKycRequests = async (req, res) => {
  try {
    const { status, search } = req.query;

    const query = {
      role: 'user',
      email: { $ne: 'admin@gmail.com' },
      kycSubmittedAt: { $exists: true },
      kycStatus: { $ne: 'NOT_SUBMITTED' }
    };

    if (status && status !== 'ALL') {
      query.kycStatus = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { memberId: searchRegex },
        { name: searchRegex },
        { contactNo: searchRegex },
        { 'kycDetails.aadharCardNumber': searchRegex },
        { 'kycDetails.panNo': searchRegex }
      ];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .lean()
      .hint(status && status !== 'ALL' ? { kycStatus: 1, kycSubmittedAt: -1, createdAt: -1 } : { kycSubmittedAt: -1 })
      .sort({ kycSubmittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const rows = users.map((user, index) => ({
      ...getKycSnapshot(user),
      sNo: skip + index + 1,
    }));

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching KYC requests',
      error: error.message,
    });
  }
};

exports.updateKycStatus = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { status, remarks } = req.body;

    if (!['APPROVED', 'PENDING', 'REJECT', 'REJECTED', 'DELETE'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid KYC status',
      });
    }

    const normalizedStatus = status === 'REJECT' ? 'REJECTED' : status;

    let updateOp = {};

    if (status === 'DELETE') {
      updateOp = {
        $set: {
          kycStatus: 'NOT_SUBMITTED',
          kycRemarks: 'KYC Request Deleted by Admin',
          kycDetails: {},
          kycReviewedAt: new Date(),
          kycReviewedBy: req.user.id,
        },
        $unset: {
          kycSubmittedAt: 1
        }
      };
    } else {
      updateOp = {
        $set: {
          kycStatus: normalizedStatus,
          kycRemarks: remarks || '',
          kycReviewedAt: new Date(),
          kycReviewedBy: req.user.id,
        }
      };
    }

    const user = await User.findOneAndUpdate(
      { memberId: memberId.toUpperCase(), role: 'user', email: { $ne: 'admin@gmail.com' } },
      updateOp,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    if (normalizedStatus === 'APPROVED') {
      if (!user.receivedWelcomeCoupon) {
        // Logic for welcome coupon moved to donationsController (after 300 donation)
      }

      // Automatically create an Order for the joining package if one doesn't exist
      if (user.joiningPackage && String(user.joiningPackage).trim()) {
        try {
          const existingOrder = await Order.findOne({
            userId: user._id,
            remark: 'Joining Package Order'
          });

          if (!existingOrder) {
            const trimmedPackage = String(user.joiningPackage).trim();
            let orderProductDoc = await Product.findOne({
              type: 'joining',
              productName: new RegExp(`^${trimmedPackage}$`, 'i'),
            }).lean();

            let orderItem = null;
            const joiningAmount = user.joiningAmount || 350;

            if (orderProductDoc) {
              orderItem = {
                productId: orderProductDoc._id,
                productCode: orderProductDoc.productCode || 'JOINING',
                name: orderProductDoc.productName,
                price: joiningAmount || orderProductDoc.dpPrice || orderProductDoc.mrp || 350,
                quantity: 1,
                totalPrice: joiningAmount || orderProductDoc.dpPrice || orderProductDoc.mrp || 350,
                imageKey: orderProductDoc.imageKey || ''
              };
            } else {
              const mongoose = require('mongoose');
              orderItem = {
                productId: new mongoose.Types.ObjectId(), // Dummy ID to satisfy schema
                productCode: 'EPIN-PKG',
                name: user.joiningPackage,
                price: joiningAmount,
                quantity: 1,
                totalPrice: joiningAmount,
                imageKey: ''
              };
            }

            const orderNo = `ORD${Math.floor(100000 + Math.random() * 900000)}`;
            const orderDate = new Date().toLocaleString('en-IN', {
              day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
            });

            await Order.create({
              userId: user._id,
              orderNo: orderNo,
              orderDate: orderDate,
              paymentMode: user.epin ? 'E-Pin' : 'E-wallet',
              paymentStatus: 'Paid',
              orderStatus: 'Pending',
              remark: 'Joining Package Order',
              orderItems: 1,
              totalPrice: orderItem.totalPrice,
              finalTotal: orderItem.totalPrice,
              items: [orderItem],
            });
          }
        } catch (orderErr) {
          console.error('Failed to create order on KYC approval:', orderErr);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'KYC status updated successfully',
      data: getKycSnapshot(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating KYC status',
      error: error.message,
    });
  }
};

exports.updateBlockStatus = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { isBlocked } = req.body;

    if (typeof isBlocked !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isBlocked must be a boolean value',
      });
    }

    const user = await User.findOneAndUpdate(
      { memberId: memberId.toUpperCase(), role: 'user', email: { $ne: 'admin@gmail.com' } },
      { $set: { isBlocked } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Member successfully ${isBlocked ? 'blocked' : 'unblocked'}`,
      data: {
        memberId: user.memberId,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating block status',
      error: error.message,
    });
  }
};

exports.getAllMembersList = async (req, res) => {
  try {
    const adminMemberId = await User.findOne({ role: 'admin' }).select('memberId').then(a => a?.memberId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.memberId) {
      query.memberId = new RegExp(req.query.memberId, 'i');
    }
    if (req.query.name) {
      query.name = new RegExp(req.query.name, 'i');
    }
    if (req.query.mobile) {
      query.contactNo = new RegExp(req.query.mobile, 'i');
    }
    if (req.query.sponsorId) {
      query.sponsorId = new RegExp(req.query.sponsorId, 'i');
    }
    if (req.query.city) {
      query.city = new RegExp(req.query.city, 'i');
    }
    if (req.query.status) {
      query.accountStatus = req.query.status;
    }

    // Fallback for generic search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { memberId: searchRegex },
        { name: searchRegex },
        { contactNo: searchRegex }
      ];
    }

    if (req.query.levelDepth !== undefined && req.query.levelDepth !== '') {
      if (req.query.levelDepth === 'INVALID' || req.query.levelDepth === '-1') {
        query.levelDepth = -1;
      } else {
        query.levelDepth = Number(req.query.levelDepth);
      }
    }

    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) {
        const eDate = new Date(req.query.endDate);
        eDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = eDate;
      }
    }

    const total = await User.countDocuments(query);

    const walletAggregation = await User.aggregate([
      { $match: query },
      { $group: { _id: null, totalWallet: { $sum: { $ifNull: ['$walletBalance', 0] } } } }
    ]);
    const totalWalletBalance = Number(walletAggregation[0]?.totalWallet || 0);

    const users = await User.find(query)
      .select('+plainPassword +plainTransactionPassword -kycDetails.aadharFrontImage -kycDetails.aadharBackImage -kycDetails.panImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Attach direct counts
    const userIds = users.map(u => u.memberId);
    const directCounts = await User.aggregate([
      { $match: { sponsorId: { $in: userIds }, accountStatus: 'ACTIVE' } },
      { $group: { _id: '$sponsorId', count: { $sum: 1 } } }
    ]);
    const directCountMap = {};
    directCounts.forEach(dc => { directCountMap[dc._id] = dc.count; });

    // Attach upgrade levels
    const upgradeLevels = await Donation.aggregate([
      { $match: { fromMemberId: { $in: userIds }, status: { $in: ['APPROVED', 'COMPLETED'] } } },
      { $group: { _id: '$fromMemberId', maxLevel: { $max: '$level' } } }
    ]);
    const upgradeLevelMap = {};
    upgradeLevels.forEach(ul => { upgradeLevelMap[ul._id] = ul.maxLevel; });

    const rows = users.map((user, index) => ({
      sNo: skip + index + 1,
      sponsorId: user.role === 'admin' ? '---' : ((user.sponsorId && user.sponsorId !== adminMemberId) ? user.sponsorId : '---'),
      memberId: user.memberId || '---',
      name: user.name || '---',
      mobile: user.contactNo || '---',
      joinDate: formatDate(user.createdAt),
      joinDateRaw: user.createdAt,
      levelDepth: user.role === 'admin' ? 0 : ((user.levelDepth !== undefined && user.levelDepth !== -1) ? user.levelDepth : 'INVALID'),
      directCount: directCountMap[user.memberId] || 0,
      upgradeLevel: upgradeLevelMap[user.memberId] || 0,
      rank: user.rank || '---',
      city: user.city || '---',
      status: user.accountStatus || 'ACTIVE',
      password: user.plainPassword || '********',
      transPassword: user.plainTransactionPassword || '********',
      wallet: Number(user.walletBalance || 0).toFixed(2),
      epin: user.epin || '---',
      joiningPackage: user.joiningPackage || '---',
      joiningAmount: user.joiningAmount || 0,
      kycStatus: user.kycStatus || 'PENDING',
      isBlocked: user.isBlocked || false,
      blockStatus: user.isBlocked ? 'Block' : 'Unblock',
      incomeStatus: user.accountStatus === 'ACTIVE' ? 'Active' : 'Inactive',
    }));

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      totalWalletBalance: Number(totalWalletBalance.toFixed(2))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching members list',
      error: error.message,
    });
  }
};

exports.getMembersLocation = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { role: 'user', email: { $ne: 'admin@gmail.com' } };

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { memberId: searchRegex },
        { name: searchRegex },
        { contactNo: searchRegex }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    const rows = users.map((user, index) => ({
      srNo: String(skip + index + 1),
      memberId: user.memberId || '---',
      name: user.name || '---',
      mobile: user.contactNo || '---',
      dob: formatDateOnly(user.dateOfBirth),
      joinDate: formatDate(user.createdAt),
      joinDateRaw: user.createdAt,
      adharNo: user.aadharNo || '---',
      panNo: user.panNo || '---',
      address: user.address || '---',
      state: getFullStateName(user.state),
      district: user.district || '---',
      city: user.city || '---',
      pinCode: user.pincode || '---',
      emailId: user.email || '---',
      status: user.accountStatus || 'ACTIVE',
    }));

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching members location',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/members/team-tree  — sponsor tree for the logged-in user (or any member for admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.getTeamTree = async (req, res) => {
  try {
    // Admin can query any memberId; user sees their own tree
    let rootMemberId = req.query.memberId
      ? req.query.memberId.toUpperCase()
      : req.user.memberId;

    if (!rootMemberId && req.user?.id) {
      const currentUser = await User.findById(req.user.id).select('memberId');
      rootMemberId = currentUser?.memberId;
    }

    if (!rootMemberId) {
      return res.status(400).json({ success: false, message: 'Member ID not found' });
    }

    const { users: allUsers, childrenBySponsor, adminMemberId } = await getAllUsersTeamStats();
    const memberIds = new Set(allUsers.map((user) => user.memberId));

    // Fetch the maximum approved donation level for all users
    const allApprovedDonations = await Donation.aggregate([
      { $match: { status: { $in: ['APPROVED', 'COMPLETED'] } } },
      { $group: { _id: '$fromMemberId', maxLevel: { $max: '$level' } } }
    ]);
    const maxDonationLevelMap = new Map();
    allApprovedDonations.forEach(d => maxDonationLevelMap.set(d._id, d.maxLevel));

    const buildNode = (memberId, depth = 0, visited = new Set()) => {
      if (visited.has(memberId)) return null; // guard against circular references
      if (depth > 1000) return null; // guard against extremely deep trees

      visited.add(memberId);
      const user = allUsers.find((u) => u.memberId === memberId);
      if (!user) {
        visited.delete(memberId);
        return null;
      }

      const children = (childrenBySponsor.get(memberId) || []).map((child) =>
        buildNode(child.memberId, depth + 1, visited)
      ).filter(Boolean);

      visited.delete(memberId);

      return {
        memberId: user.memberId,
        name: user.name,
        mobile: user.contactNo || '---',
        joinDate: formatDate(user.createdAt),
        joinDateRaw: user.createdAt,
        city: user.city || '---',
        status: user.accountStatus || 'ACTIVE',
        unlockLevel: maxDonationLevelMap.get(user.memberId) ?? 0,
        upgradeLevel: maxDonationLevelMap.get(user.memberId) ?? 0,
        rank: user.rank || '---',
        directCount: children.filter(c => c.status === 'ACTIVE').length,
        children,
      };
    };

    if (req.user.role === 'admin' && !req.query.memberId) {
      const rootNodes = allUsers
        .filter((user) => !user.sponsorId || !memberIds.has(user.sponsorId))
        .map((user) => buildNode(user.memberId))
        .filter(Boolean);

      return res.status(200).json({
        success: true,
        data: {
          memberId: 'ROOT',
          name: 'All Members',
          mobile: '---',
          joinDate: formatDate(new Date()),
          status: 'ACTIVE',
          unlockLevel: 10,
          upgradeLevel: 10,
          rank: '---',
          directCount: rootNodes.length,
          children: rootNodes,
        },
      });
    }

    const tree = buildNode(rootMemberId);
    if (!tree) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.status(200).json({ success: true, data: tree });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const calculateRank = (activeDirectsCount, upgradeLevel, totalIncome) => {
  // All 3 conditions must be met: targetEarning, 10 active directs, and self-upgrade level
  if (totalIncome >= 50000000 && upgradeLevel >= 10 && activeDirectsCount >= 10) return 'CROWN DIAMOND';
  if (totalIncome >= 10000000 && upgradeLevel >= 9 && activeDirectsCount >= 10) return 'DIAMOND';
  if (totalIncome >= 5000000 && upgradeLevel >= 8 && activeDirectsCount >= 10) return 'EMERALD';
  if (totalIncome >= 2500000 && upgradeLevel >= 7 && activeDirectsCount >= 10) return 'PLATINUM';
  if (totalIncome >= 1000000 && upgradeLevel >= 6 && activeDirectsCount >= 10) return 'GOLD';
  if (totalIncome >= 500000 && upgradeLevel >= 5 && activeDirectsCount >= 10) return 'SILVER';
  if (totalIncome >= 100000 && upgradeLevel >= 4 && activeDirectsCount >= 10) return 'BRONZE';
  if (totalIncome >= 50000 && upgradeLevel >= 3 && activeDirectsCount >= 10) return 'STAR';
  if (totalIncome >= 25000 && upgradeLevel >= 2 && activeDirectsCount >= 10) return 'ACHIEVER';
  if (totalIncome >= 3000 && upgradeLevel >= 1 && activeDirectsCount >= 10) return 'STARTER';
  return '---';
};

exports.getMemberPerformance = async (req, res) => {
  try {
    const { users, statsMap, adminMemberId } = await getAllUsersTeamStats();
    const depthMap = calculateLevelDepths(users, adminMemberId);
    const completedDonations = await Donation.aggregate([
      { $match: { status: { $in: ['APPROVED', 'COMPLETED'] } } },
      { $group: { _id: '$fromMemberId', maxLevel: { $max: '$level' } } }
    ]);
    const upgradeLevelMap = new Map(completedDonations.map((donation) => [donation._id, donation.maxLevel]));

    const [levelIncomeAgg, repurchaseIncomeAgg, donationReceivedAgg] = await Promise.all([
      LevelIncome.aggregate([
        { $group: { _id: '$recipientMemberId', total: { $sum: '$amount' } } }
      ]),
      RepurchaseIncome.aggregate([
        { $group: { _id: '$recipientMemberId', total: { $sum: '$amount' } } }
      ]),
      Donation.aggregate([
        { $match: { status: { $in: ['APPROVED', 'COMPLETED'] } } },
        { $group: { _id: '$toMemberId', total: { $sum: '$amount' } } }
      ])
    ]);

    const levelIncomeMap = new Map(levelIncomeAgg.map((item) => [item._id, item.total]));
    const repurchaseIncomeMap = new Map(repurchaseIncomeAgg.map((item) => [item._id, item.total]));
    const donationReceivedMap = new Map(donationReceivedAgg.map((item) => [item._id, item.total]));

    const rows = users.map((user, index) => {
      const stats = statsMap.get(user.memberId);
      const descendants = stats.descendants;
      const activeDescendants = descendants.filter((descendant) => descendant.accountStatus === 'ACTIVE');
      const inactiveDescendants = descendants.filter((descendant) => descendant.accountStatus !== 'ACTIVE');
      const totalTeamCount = stats.totalTeamCount;
      const activeTeamCount = activeDescendants.length;
      const inactiveTeamCount = inactiveDescendants.length;
      const levelIncome = levelIncomeMap.get(user.memberId) || 0;
      const repurchaseIncome = repurchaseIncomeMap.get(user.memberId) || 0;
      const donationIncome = donationReceivedMap.get(user.memberId) || 0;
      const totalIncome = levelIncome + repurchaseIncome + donationIncome;

      const directsCount = descendants.filter((d) => d.sponsorId === user.memberId && d.accountStatus === 'ACTIVE').length;
      const unlockLevel = upgradeLevelMap.get(user.memberId) ?? 0;
      const calculatedRank = calculateRank(directsCount, unlockLevel, totalIncome);

      // Async update user rank in DB if it changed
      if (user.rank !== calculatedRank) {
        User.updateOne({ memberId: user.memberId }, { $set: { rank: calculatedRank } }).exec();
      }

      return {
        memberId: user.memberId || '---',
        memberName: user.name || '---',
        mobile: user.contactNo || '---',
        email: user.email || '---',
        joinDate: formatDate(user.createdAt),
        joinDateRaw: user.createdAt,
        status: user.accountStatus || 'ACTIVE',
        levelDepth: depthMap.get(user.memberId) || 0,
        unlockLevel,
        rank: calculatedRank,
        isRankVisible: user.isRankVisible !== false,
        activeTeamCount,
        inactiveTeamCount,
        totalTeamCount,
        directsCount,
        levelIncome,
        repurchaseIncome,
        donationIncome,
        totalIncome,
        panNo: user.panNo || '---',
      };
    });

    // Sort by earning (top earning wise)
    rows.sort((a, b) => b.totalIncome - a.totalIncome);

    // Reassign serial number after sorting
    const sortedRows = rows.map((row, index) => ({
      sNo: index + 1,
      ...row
    }));

    res.status(200).json({
      success: true,
      data: sortedRows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching member performance',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/members/rank-holders  — user-facing rank holders list (no sensitive data)
// ─────────────────────────────────────────────────────────────────────────────
exports.getRankHolders = async (req, res) => {
  try {
    const { users, statsMap } = await getAllUsersTeamStats();
    const completedDonations = await Donation.aggregate([
      { $match: { status: { $in: ['APPROVED', 'COMPLETED'] } } },
      { $group: { _id: '$fromMemberId', maxLevel: { $max: '$level' } } }
    ]);
    const upgradeLevelMap = new Map(completedDonations.map((donation) => [donation._id, donation.maxLevel]));

    const [levelIncomeAgg, repurchaseIncomeAgg, donationReceivedAgg] = await Promise.all([
      LevelIncome.aggregate([
        { $group: { _id: '$recipientMemberId', total: { $sum: '$amount' } } }
      ]),
      RepurchaseIncome.aggregate([
        { $group: { _id: '$recipientMemberId', total: { $sum: '$amount' } } }
      ]),
      Donation.aggregate([
        { $match: { status: { $in: ['APPROVED', 'COMPLETED'] } } },
        { $group: { _id: '$toMemberId', total: { $sum: '$amount' } } }
      ])
    ]);

    const levelIncomeMap = new Map(levelIncomeAgg.map((item) => [item._id, item.total]));
    const repurchaseIncomeMap = new Map(repurchaseIncomeAgg.map((item) => [item._id, item.total]));
    const donationReceivedMap = new Map(donationReceivedAgg.map((item) => [item._id, item.total]));

    const rankHolders = [];
    let sNo = 1;

    users.forEach((user) => {
      const stats = statsMap.get(user.memberId);
      if (!stats) return;

      const descendants = stats.descendants;
      const directsCount = descendants.filter((d) => d.sponsorId === user.memberId && d.accountStatus === 'ACTIVE').length;
      const unlockLevel = upgradeLevelMap.get(user.memberId) ?? 0;
      const levelIncome = levelIncomeMap.get(user.memberId) || 0;
      const repurchaseIncome = repurchaseIncomeMap.get(user.memberId) || 0;
      const donationIncome = donationReceivedMap.get(user.memberId) || 0;
      const totalIncome = levelIncome + repurchaseIncome + donationIncome;

      const rank = calculateRank(directsCount, unlockLevel, totalIncome);

      // Also update rank in DB if changed
      if (user.rank !== rank) {
        User.updateOne({ memberId: user.memberId }, { $set: { rank } }).exec();
      }

      // Only include users who have actually earned a rank
      if (rank === '---') return;

      // Do not include users who have been hidden from rank list by admin
      if (user.isRankVisible === false) return;

      rankHolders.push({
        sNo: sNo++,
        memberId: user.memberId || '---',
        memberName: user.name || '---',
        joinDate: formatDate(user.createdAt),
        city: user.city || '---',
        directsCount,
        totalTeamCount: stats.totalTeamCount,
        unlockLevel,
        totalIncome,
        rank,
      });
    });

    res.status(200).json({
      success: true,
      data: rankHolders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rank holders',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/members/tree-node  — get a single member and their immediate directs
// ─────────────────────────────────────────────────────────────────────────────
exports.getTreeNode = async (req, res) => {
  try {
    let rootMemberId = req.query.memberId
      ? req.query.memberId.toUpperCase()
      : req.user.memberId;

    if (!rootMemberId && req.user?.id) {
      const currentUser = await User.findById(req.user.id).select('memberId');
      rootMemberId = currentUser?.memberId;
    }

    if (!rootMemberId) {
      return res.status(400).json({ success: false, message: 'Member ID not found' });
    }

    const nodeUser = await User.findOne({ memberId: rootMemberId }).lean();
    if (!nodeUser) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Get immediate directs
    let directsQuery = { sponsorId: rootMemberId };
    if (nodeUser.role === 'admin') {
      directsQuery = {
        $or: [
          { sponsorId: rootMemberId },
          { sponsorId: "" },
          { sponsorId: null },
          { sponsorId: { $exists: false } }
        ],
        role: { $ne: 'admin' }
      };
    }
    const directs = await User.find(directsQuery).sort({ createdAt: 1 }).lean();

    // Count their directs to determine if they can be expanded
    const childIds = directs.map(d => d.memberId);
    const grandChildrenCounts = await User.aggregate([
      { $match: { sponsorId: { $in: childIds } } },
      { $group: { _id: '$sponsorId', count: { $sum: 1 }, activeCount: { $sum: { $cond: [{ $eq: ['$accountStatus', 'ACTIVE'] }, 1, 0] } } } }
    ]);
    const gcMap = {};
    grandChildrenCounts.forEach(gc => { gcMap[gc._id] = gc; });

    const { statsMap } = await getAllUsersTeamStats();

    // Fetch the maximum approved donation level for all users
    const allApprovedDonations = await Donation.aggregate([
      { $match: { status: { $in: ['APPROVED', 'COMPLETED'] } } },
      { $group: { _id: '$fromMemberId', maxLevel: { $max: '$level' } } }
    ]);
    const maxDonationLevelMap = new Map();
    allApprovedDonations.forEach(d => maxDonationLevelMap.set(d._id, d.maxLevel));

    const formatUser = (user, gcCount = 0, gcActive = 0) => {
      const stats = statsMap.get(user.memberId) || { totalTeamCount: 0 };
      const teamSize = stats.totalTeamCount;
      const upgradeLevel = maxDonationLevelMap.get(user.memberId) ?? 0;

      return {
        memberId: user.memberId,
        name: user.name,
        mobile: user.contactNo || '---',
        joinDate: formatDate(user.createdAt),
        joinDateRaw: user.createdAt,
        city: user.city || '---',
        status: user.accountStatus || 'ACTIVE',
        levelDepth: user.levelDepth !== undefined && user.levelDepth !== -1 ? user.levelDepth : 0,
        totalDirect: gcCount,
        activeDirect: gcActive,
        teamSize,
        upgradeLevel,
        sponsorId: user.sponsorId,
        hasChildren: gcCount > 0
      };
    };

    const rootTotalDirect = directs.length;
    const rootActiveDirect = directs.filter(d => d.accountStatus === 'ACTIVE').length;

    res.status(200).json({
      success: true,
      data: {
        ...formatUser(nodeUser, rootTotalDirect, rootActiveDirect),
        children: directs.map(d => formatUser(d, gcMap[d.memberId]?.count || 0, gcMap[d.memberId]?.activeCount || 0))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMemberProfile = async (req, res) => {
  try {
    const user = await User.findOne({ memberId: req.params.memberId }).lean();
    if (!user) return res.status(404).json({ success: false, message: 'Member not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMemberProfile = async (req, res) => {
  try {
    const user = await User.findOne({ memberId: req.params.memberId });
    if (!user) return res.status(404).json({ success: false, message: 'Member not found' });

    const { password, transPassword, ...otherFields } = req.body;

    // Update general fields
    Object.assign(user, otherFields);

    // Only update passwords if they are provided and not empty
    if (password && password.trim() !== '') {
      user.password = password;
    }

    if (transPassword && transPassword.trim() !== '') {
      user.transactionPassword = transPassword;
    }

    await user.save(); // Triggers the pre-save hooks for hashing

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/members/my-datewise-income — logged-in user's datewise income summary
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyDatewiseIncome = async (req, res) => {
  try {
    const memberId = String(req.user.memberId || '').trim();
    if (!memberId) {
      return res.status(400).json({ success: false, message: 'Member ID not found for current user' });
    }

    const user = await User.findOne({ memberId }).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const normalizedMemberId = String(user.memberId || '').trim();
    const escapedMemberId = normalizedMemberId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s/g, '\\s*');

    const [levelIncomeRecords, repurchaseIncomeRecords] = await Promise.all([
      LevelIncome.find({ recipientMemberId: new RegExp(`^\\s*${escapedMemberId}\\s*$`, 'i') }).lean(),
      RepurchaseIncome.find({ recipientMemberId: new RegExp(`^\\s*${escapedMemberId}\\s*$`, 'i') }).lean(),
    ]);

    const dailyMap = new Map();

    const processRecord = (record, type) => {
      const dateObj = new Date(record.createdAt);
      if (Number.isNaN(dateObj.getTime())) return;

      const dateKey = dateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      const mapKey = `${normalizedMemberId}__${dateKey}`;

      if (!dailyMap.has(mapKey)) {
        dailyMap.set(mapKey, {
          memberId: normalizedMemberId,
          dateKey,
          rawDate: dateObj,
          levelIncome: 0,
          repurchaseIncome: 0,
          totalBvPoint: 0,
          count: 0,
          levelIncomeCount: 0,
          mapKey,
        });
      }

      const entry = dailyMap.get(mapKey);
      const amount = Number(record.amount || 0);

      if (type === 'level') {
        entry.levelIncome += amount;
        entry.levelIncomeCount += 1;
      } else if (type === 'repurchase') {
        entry.repurchaseIncome += amount;
        entry.totalBvPoint += amount;
        // Repurchase IDs are not added to totalIds because totalIds is used for Level Incomes
      }
      entry.count += 1;

      if (dateObj > entry.rawDate) {
        entry.rawDate = dateObj;
      }
    };

    levelIncomeRecords.forEach((rec) => processRecord(rec, 'level'));
    repurchaseIncomeRecords.forEach((rec) => processRecord(rec, 'repurchase'));

    if (dailyMap.size === 0) {
      const row = {
        sNo: 1,
        incomeDate: formatDateOnly(user.createdAt),
        dateRaw: user.createdAt,
        memberId: user.memberId,
        memberName: user.name || '---',
        totalIds: 0,
        levelIncome: 0,
        totalBvPoint: 0,
        repurchaseIncome: 0,
        dailyIncome: 0,
      };
      return res.status(200).json({ success: true, data: [row] });
    }

    const rows = [];
    dailyMap.forEach((entry) => {
      const roundedLevelIncome = Number(entry.levelIncome.toFixed(2));
      const roundedRepurchaseIncome = Number(entry.repurchaseIncome.toFixed(2));
      const roundedTotalBvPoint = Number(entry.totalBvPoint.toFixed(2));
      const dailyIncome = Number((roundedLevelIncome + roundedRepurchaseIncome).toFixed(2));

      const incomeDate = entry.rawDate.toLocaleDateString('en-GB', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).replace(/\//g, '-');

      rows.push({
        incomeDate,
        dateRaw: entry.rawDate,
        memberId: entry.memberId,
        memberName: user.name || '---',
        totalIds: entry.levelIncomeCount,
        levelIncome: roundedLevelIncome,
        totalBvPoint: roundedTotalBvPoint,
        repurchaseIncome: roundedRepurchaseIncome,
        dailyIncome,
      });
    });

    rows.sort((a, b) => new Date(b.dateRaw) - new Date(a.dateRaw));
    rows.forEach((r, idx) => {
      r.sNo = idx + 1;
    });

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper to build real daily payout records from LevelIncome & RepurchaseIncome
// ─────────────────────────────────────────────────────────────────────────────
const buildDailyPayoutRecords = async ({ memberId, memberName, startDate, endDate } = {}) => {
  const planSetting = await SiteSetting.findOne({ settingKey: 'plan-setting' }).lean();
  const tdsRate = Number((planSetting?.data?.tdsCharge || '5 %').replace('%', '').trim()) / 100 || 0.05;
  const adminChargeRate = Number((planSetting?.data?.adminCharges || '5 %').replace('%', '').trim()) / 100 || 0.05;

  const query = { status: { $ne: 'REJECTED' } };
  if (memberId && typeof memberId === 'string' && memberId.trim() !== '') {
    query.recipientMemberId = new RegExp(memberId.trim(), 'i');
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      const sDate = new Date(startDate);
      sDate.setHours(0, 0, 0, 0);
      query.createdAt.$gte = sDate;
    }
    if (endDate) {
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      query.createdAt.$lte = eDate;
    }
  }

  const [levelIncomes, repurchaseIncomes] = await Promise.all([
    LevelIncome.find(query).lean(),
    RepurchaseIncome.find(query).lean(),
  ]);

  const dailyMap = new Map();

  const processRecord = (record, type) => {
    const recMemberId = record.recipientMemberId;
    if (!recMemberId) return;

    const dateObj = new Date(record.createdAt);
    if (Number.isNaN(dateObj.getTime())) return;

    const dateKey = dateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const mapKey = `${recMemberId}__${dateKey}`;

    if (!dailyMap.has(mapKey)) {
      dailyMap.set(mapKey, {
        memberId: recMemberId,
        dateKey,
        rawDate: dateObj,
        levelIncome: 0,
        repurchaseIncome: 0,
      });
    }

    const entry = dailyMap.get(mapKey);
    if (type === 'level') {
      entry.levelIncome += Number(record.amount || 0);
    } else if (type === 'repurchase') {
      entry.repurchaseIncome += Number(record.amount || 0);
    }

    if (dateObj > entry.rawDate) {
      entry.rawDate = dateObj;
    }
  };

  levelIncomes.forEach((rec) => processRecord(rec, 'level'));
  repurchaseIncomes.forEach((rec) => processRecord(rec, 'repurchase'));

  if (dailyMap.size === 0) {
    return [];
  }

  const uniqueMemberIds = [...new Set(Array.from(dailyMap.values()).map((e) => e.memberId))];
  const users = await User.find({ memberId: { $in: uniqueMemberIds } }).select('memberId name accountStatus').lean();
  const userMap = new Map(users.map((u) => [u.memberId, u]));

  const rows = [];
  dailyMap.forEach((entry) => {
    const user = userMap.get(entry.memberId);
    const mName = user?.name || '---';

    if (memberName && typeof memberName === 'string' && memberName.trim() !== '') {
      if (!mName.toLowerCase().includes(memberName.toLowerCase().trim())) {
        return;
      }
    }

    const grossIncome = entry.levelIncome + entry.repurchaseIncome;
    const tds = Number((grossIncome * tdsRate).toFixed(2));
    const adminCharge = Number((grossIncome * adminChargeRate).toFixed(2));
    const netPayable = Number((grossIncome - tds - adminCharge).toFixed(2));
    const status = user?.accountStatus === 'IN-ACTIVE' ? 'Pending' : 'Credited To E-wallet';

    const incomeDate = entry.rawDate.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-');

    rows.push({
      incomeDate,
      date: incomeDate,
      dateKey: entry.dateKey,
      rawDate: entry.rawDate,
      memberId: entry.memberId,
      toMemberId: entry.memberId,
      memberName: mName,
      toName: mName,
      levelIncome: Number(entry.levelIncome.toFixed(2)),
      repurchaseIncome: Number(entry.repurchaseIncome.toFixed(2)),
      grossIncome: Number(grossIncome.toFixed(2)),
      amount: Number(grossIncome.toFixed(2)),
      tds,
      adminCharge,
      netPayable,
      status,
    });
  });

  rows.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
  rows.forEach((r, idx) => {
    r.sNo = idx + 1;
  });

  return rows;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/members/my-daily-payout — logged-in user's daily payout summary
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyDailyPayout = async (req, res) => {
  try {
    const memberId = req.user.memberId;
    if (!memberId) {
      return res.status(400).json({ success: false, message: 'Member ID not found for current user' });
    }

    const rows = await buildDailyPayoutRecords({ memberId });

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/members/daily-payout-report — Admin Daily Payout Report
// ─────────────────────────────────────────────────────────────────────────────
exports.getDailyPayoutReport = async (req, res) => {
  try {
    const { memberId, memberName, startDate, endDate } = req.query;
    const rows = await buildDailyPayoutRecords({ memberId, memberName, startDate, endDate });
    const totalPayoutAmount = rows.reduce((sum, r) => sum + Number(r.netPayable || 0), 0);

    res.status(200).json({
      success: true,
      data: rows,
      totalEntries: rows.length,
      totalPayoutAmount: Number(totalPayoutAmount.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
