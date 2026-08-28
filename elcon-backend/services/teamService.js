const User = require('../models/User');

/**
 * Build an in-memory graph of the referral tree.
 * O(N) time and space complexity.
 */
const buildReferralGraph = (users, adminMemberId = null) => {
  const childrenBySponsor = new Map();

  users.forEach((user) => {
    let sponsorKey = String(user.sponsorId || '').trim();
    
    // Ignore admin as sponsor to prevent automatically showing admin ID as referrer
    if (adminMemberId && sponsorKey === adminMemberId) {
      sponsorKey = '';
    }

    if (!sponsorKey) {
      return;
    }

    if (!childrenBySponsor.has(sponsorKey)) {
      childrenBySponsor.set(sponsorKey, []);
    }

    childrenBySponsor.get(sponsorKey).push(user);
  });

  return childrenBySponsor;
};

/**
 * Recursively collect all descendants (indirect and direct) for a given memberId.
 */
const collectDescendants = (memberId, childrenBySponsor) => {
  const stack = [...(childrenBySponsor.get(memberId) || [])];
  const descendants = [];
  const visited = new Set(); // Prevent infinite loops in case of circular references

  while (stack.length > 0) {
    const current = stack.pop();
    
    if (visited.has(current.memberId)) {
        continue;
    }
    visited.add(current.memberId);
    
    descendants.push(current);

    const nextChildren = childrenBySponsor.get(current.memberId) || [];
    stack.push(...nextChildren);
  }

  return descendants;
};

/**
 * Centralized function to calculate the complete descendant tree stats for a single user.
 * Avoids repeated database queries by building the whole tree in memory once.
 * @param {string} memberId - Target member ID
 */
const getTeamStats = async (memberId) => {
  const adminMemberId = await User.findOne({ role: 'admin' }).select('memberId').then(a => a?.memberId);
  const allUsers = await User.find({ role: 'user', email: { $ne: 'admin@gmail.com' } }).select('memberId sponsorId name createdAt city accountStatus rank unlockLevel -_id').lean();
  
  const childrenBySponsor = buildReferralGraph(allUsers, adminMemberId);
  
  const directReferrals = childrenBySponsor.get(memberId) || [];
  const descendants = collectDescendants(memberId, childrenBySponsor);
  
  return {
    directCount: directReferrals.length,
    totalTeamCount: descendants.length,
    directReferrals,
    descendants,
    allUsers,
    adminMemberId,
    childrenBySponsor
  };
};

/**
 * Fetch stats for ALL users efficiently. (Used by member performance lists)
 */
const getAllUsersTeamStats = async () => {
    const adminMemberId = await User.findOne({ role: 'admin' }).select('memberId').then(a => a?.memberId);
    // Use .lean() and select only required fields for performance
    const users = await User.find({ role: 'user', email: { $ne: 'admin@gmail.com' } }).select('memberId sponsorId name createdAt city accountStatus rank unlockLevel -_id').lean();
    const childrenBySponsor = buildReferralGraph(users, adminMemberId);

    const statsMap = new Map();
    users.forEach(user => {
      const descendants = collectDescendants(user.memberId, childrenBySponsor);
      const directReferrals = childrenBySponsor.get(user.memberId) || [];
      statsMap.set(user.memberId, {
        directCount: directReferrals.length,
        totalTeamCount: descendants.length,
        descendants,
        directReferrals,
      });
    });

    return { users, childrenBySponsor, statsMap, adminMemberId };
};

/**
 * Calculates the level depth of each user from the root.
 * Root = 0, Directs = 1, etc.
 */
const calculateLevelDepths = (users, adminMemberId = null) => {
  const depthMap = new Map();
  const userMap = new Map(users.map(u => [u.memberId, u]));

  const getDepth = (memberId, visited = new Set()) => {
    if (!memberId || visited.has(memberId)) return 1; // root or circular
    if (depthMap.has(memberId)) return depthMap.get(memberId);

    const user = userMap.get(memberId);
    if (!user) return 1;

    let sponsorKey = String(user.sponsorId || '').trim();
    if (adminMemberId && sponsorKey === adminMemberId) {
      sponsorKey = '';
    }

    if (!sponsorKey || !userMap.has(sponsorKey)) {
      depthMap.set(memberId, 1);
      return 1;
    }

    visited.add(memberId);
    const depth = 1 + getDepth(sponsorKey, visited);
    visited.delete(memberId);

    depthMap.set(memberId, depth);
    return depth;
  };

  users.forEach(u => getDepth(u.memberId));
  return depthMap;
};

module.exports = {
  buildReferralGraph,
  collectDescendants,
  getTeamStats,
  getAllUsersTeamStats,
  calculateLevelDepths
};
