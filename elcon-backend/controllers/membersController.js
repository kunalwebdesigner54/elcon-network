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
    
    // Add filtering based on frontend keys if needed here, but standardizing on simple pagination first
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { memberId: searchRegex },
        { name: searchRegex },
        { contactNo: searchRegex }
      ];
    }
    if (req.query.status) {
      query.accountStatus = req.query.status;
    }

    if (req.query.levelDepth !== undefined && req.query.levelDepth !== '') {
      if (req.query.levelDepth === 'INVALID' || req.query.levelDepth === '-1') {
        query.levelDepth = -1;
      } else {
        query.levelDepth = Number(req.query.levelDepth);
      }
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('+plainPassword +plainTransactionPassword -kycDetails.aadharFrontImage -kycDetails.aadharBackImage -kycDetails.panImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const rows = users.map((user, index) => ({
      sNo: skip + index + 1,
      sponsorId: (user.sponsorId && user.sponsorId !== adminMemberId) ? user.sponsorId : '---',
      memberId: user.memberId || '---',
      name: user.name || '---',
      mobile: user.contactNo || '---',
      joinDate: formatDate(user.createdAt),
      joinDateRaw: user.createdAt,
      levelDepth: (user.levelDepth !== undefined && user.levelDepth !== -1) ? user.levelDepth : 'INVALID',
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
      state: user.state || '---',
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
    let rootMemberId = req.user.role === 'admin' && req.query.memberId
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
        unlockLevel: user.unlockLevel || 1,
        upgradeLevel: maxDonationLevelMap.get(user.memberId) || 0,
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

exports.getMemberPerformance = async (req, res) => {
  try {
    const { users, statsMap, adminMemberId } = await getAllUsersTeamStats();
    const depthMap = calculateLevelDepths(users, adminMemberId);

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

      return {
        sNo: index + 1,
        memberId: user.memberId || '---',
        memberName: user.name || '---',
        mobile: user.contactNo || '---',
        joinDate: formatDate(user.createdAt),
        joinDateRaw: user.createdAt,
        status: user.accountStatus || 'ACTIVE',
        levelDepth: depthMap.get(user.memberId) || 0,
        unlockLevel: user.unlockLevel || 1,
        rank: user.rank || '---',
        activeTeamCount,
        inactiveTeamCount,
        totalTeamCount,
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