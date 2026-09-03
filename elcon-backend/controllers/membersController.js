const User = require('../models/User');
const Donation = require('../models/Donation');
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
      .select('-kycDetails.aadharFrontImage -kycDetails.aadharBackImage -kycDetails.panImage')
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

    if (normalizedStatus === 'APPROVED' && !user.receivedWelcomeCoupon) {
      // Logic for welcome coupon moved to donationsController (after 300 donation)
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

    const query = { role: 'user', email: { $ne: 'admin@gmail.com' } };
    
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
      sponsorId: (user.sponsorId && user.sponsorId !== adminMemberId) ? user.sponsorId : '---',
      memberId: user.memberId || '---',
      name: user.name || '---',
      mobile: user.contactNo || '---',
      joinDate: formatDate(user.createdAt),
      joinDateRaw: user.createdAt,
      levelDepth: (user.levelDepth !== undefined && user.levelDepth !== -1) ? user.levelDepth : 'INVALID',
      directCount: directCountMap[user.memberId] || 0,
      upgradeLevel: upgradeLevelMap[user.memberId] || 0,
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
      }
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
      dob: formatDate(user.dateOfBirth),
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

const calculateRank = (directsCount, upgradeLevel, totalIncome) => {
  if (totalIncome >= 256000 && upgradeLevel >= 10 && directsCount >= 10) return 'CROWN DIAMOND';
  if (totalIncome >= 128000 && upgradeLevel >= 9 && directsCount >= 9) return 'DIAMOND';
  if (totalIncome >= 64000 && upgradeLevel >= 8 && directsCount >= 8) return 'EMERALD';
  if (totalIncome >= 32000 && upgradeLevel >= 7 && directsCount >= 7) return 'PLATINUM';
  if (totalIncome >= 16000 && upgradeLevel >= 6 && directsCount >= 6) return 'GOLD';
  if (totalIncome >= 8000 && upgradeLevel >= 5 && directsCount >= 5) return 'SILVER';
  if (totalIncome >= 4000 && upgradeLevel >= 4 && directsCount >= 4) return 'BRONZE';
  if (totalIncome >= 2000 && upgradeLevel >= 3 && directsCount >= 3) return 'STAR';
  if (totalIncome >= 1000 && upgradeLevel >= 2 && directsCount >= 2) return 'ACHIEVER';
  if (totalIncome >= 300 && upgradeLevel >= 1 && directsCount >= 1) return 'STARTER';
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

    const rows = users.map((user, index) => {
      const stats = statsMap.get(user.memberId);
      const descendants = stats.descendants;
      const activeDescendants = descendants.filter((descendant) => descendant.accountStatus === 'ACTIVE');
      const inactiveDescendants = descendants.filter((descendant) => descendant.accountStatus !== 'ACTIVE');
      const totalTeamCount = stats.totalTeamCount;
      const activeTeamCount = activeDescendants.length;
      const inactiveTeamCount = inactiveDescendants.length;
      const levelIncome = totalTeamCount * 100;
      const repurchaseIncome = totalTeamCount * 100;
      const donationIncome = totalTeamCount * 50;
      const totalIncome = levelIncome + repurchaseIncome + donationIncome;

      const directsCount = descendants.filter((d) => d.sponsorId === user.memberId).length;
      const unlockLevel = upgradeLevelMap.get(user.memberId) ?? 0;
      const calculatedRank = calculateRank(directsCount, unlockLevel, totalIncome);

      // Async update user rank in DB if it changed
      if (user.rank !== calculatedRank) {
        User.updateOne({ memberId: user.memberId }, { $set: { rank: calculatedRank } }).exec();
      }

      return {
        sNo: index + 1,
        memberId: user.memberId || '---',
        memberName: user.name || '---',
        mobile: user.contactNo || '---',
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
      };
    });

    res.status(200).json({
      success: true,
      data: rows,
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
    const user = await User.findOne({ memberId: req.params.memberId })
      .select('+plainPassword +plainTransactionPassword')
      .lean();
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
    const memberId = req.user.memberId;
    if (!memberId) {
      return res.status(400).json({ success: false, message: 'Member ID not found for current user' });
    }

    const user = await User.findOne({ memberId }).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const levelIncome = Number(user.levelIncome || 0);
    const repurchaseIncome = Number(user.repurchaseIncome || 0);
    const donationIncome = Number(user.donationIncome || 0);
    const totalIncome = levelIncome + repurchaseIncome + donationIncome;
    const totalTeamCount = Number(user.totalTeamCount || user.teamCount || 0);
    const directsCount = Number(user.directsCount || user.directMembers || 0);

    const row = {
      sNo: 1,
      incomeDate: formatDate(user.createdAt),
      memberId: user.memberId,
      memberName: user.name || '---',
      totalIds: totalTeamCount,
      levelIncome,
      totalBvPoint: totalTeamCount * 100,
      repurchaseIncome,
      dailyIncome: totalIncome,
    };

    res.status(200).json({ success: true, data: [row] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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

    const user = await User.findOne({ memberId }).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const levelIncome = Number(user.levelIncome || 0);
    const repurchaseIncome = Number(user.repurchaseIncome || 0);
    const grossIncome = levelIncome + repurchaseIncome;
    const tds = grossIncome * 0.05;
    const adminCharge = grossIncome * 0.05;
    const netPayable = grossIncome - tds - adminCharge;

    const row = {
      sNo: 1,
      incomeDate: formatDate(user.createdAt),
      memberId: user.memberId,
      memberName: user.name || '---',
      levelIncome,
      repurchaseIncome,
      grossIncome,
      tds,
      adminCharge,
      netPayable,
      status: user.accountStatus === 'IN-ACTIVE' ? 'Pending' : 'Credited To E-wallet',
    };

    res.status(200).json({ success: true, data: [row] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
