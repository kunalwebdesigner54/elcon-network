const User = require('../models/User');
const Donation = require('../models/Donation');

/**
 * Helper to get the actual consecutive completed self-upgrade level for a member based on approved donations.
 * @param {String} memberId 
 * @returns {Number} Maximum sequential completed level (0 if none)
 */
const getActualCompletedLevel = async (memberId) => {
  const donations = await Donation.find({
    fromMemberId: memberId,
    status: { $in: ['APPROVED', 'COMPLETED'] }
  }).select('level').lean();
  
  if (!donations || donations.length === 0) return 0;
  
  const levels = new Set(donations.map(d => d.level));
  let maxLevel = 0;
  
  // Enforce sequential levels
  for (let i = 1; i <= 10; i++) {
    if (levels.has(i)) {
      maxLevel = i;
    } else {
      break;
    }
  }
  return maxLevel;
};

/**
 * The Centralized Upline Engine for evaluating eligibility and handling skips.
 * It traverses the physical sponsor chain from the starting member up to the admin.
 * 
 * @param {String} startMemberId - The ID of the member whose action triggered this (new joiner or upgrader)
 * @param {Number} targetLogicalLevel - The max logical level/slot to reach (10 for LevelIncome, X for Donation)
 * @param {String} planType - 'LEVEL_INCOME' or 'DONATION'
 * @param {Number} startingLogicalLevel - The logical slot to start filling (1 for LevelIncome, X for Donation)
 * 
 * @returns {Object} { receivers: Array of { logicalLevel, member, physicalDepth }, skipped: Array of { memberId, reason, failedAtLogicalLevel } }
 */
const getLogicalUplines = async (startMemberId, targetLogicalLevel, planType, startingLogicalLevel = 1) => {
  const receivers = [];
  const skipped = [];
  
  let currentLogicalLevel = startingLogicalLevel;
  let physicalDepth = 0;
  
  // Start from the sponsor
  const startUser = await User.findOne({ memberId: startMemberId }).select('sponsorId accountStatus').lean();
  if (!startUser) return { receivers, skipped };
  
  let currentMemberId = startUser.sponsorId;
  const visited = new Set();
  
  while (currentMemberId && currentLogicalLevel <= targetLogicalLevel) {
    if (visited.has(currentMemberId)) {
      console.warn(`[UplineEngine] Circular dependency detected at ${currentMemberId}`);
      break;
    }
    visited.add(currentMemberId);
    physicalDepth++;
    
    const candidate = await User.findOne({ memberId: currentMemberId }).lean();
    if (!candidate) break;
    
    // Admin bypasses all checks
    const isAdmin = candidate.role === 'admin';
    const isAccountValid = isAdmin || (candidate.accountStatus === 'ACTIVE' && candidate.isBlocked === false);
    
    let isEligible = false;
    let failReason = '';
    
    if (!isAccountValid) {
      failReason = 'Account is not ACTIVE or is blocked';
    } else if (isAdmin) {
      isEligible = true; // Admin gets it unconditionally
    } else {
      // 1. Calculate strictly active direct count
      let activeDirectsCount = await User.countDocuments({
        sponsorId: currentMemberId,
        accountStatus: 'ACTIVE'
      });
      
      // If the candidate is the direct sponsor of the person making the payment, 
      // and the person making the payment is NOT active yet (e.g., paying Level 1),
      // we must count them as 1 direct towards this qualification!
      if (startUser.sponsorId === currentMemberId && startUser.accountStatus !== 'ACTIVE') {
        activeDirectsCount += 1;
      }
      
      const requiredDirects = currentLogicalLevel; // Direct requirement always matches the logical slot level being checked
      
      if (planType === 'LEVEL_INCOME') {
        // Level Income logic
        if (currentLogicalLevel === 1) {
          // Sponsor auto-qualifies for level 1 (even though payout is 0, it consumes the slot)
          isEligible = true;
        } else {
          if (activeDirectsCount >= requiredDirects) {
            isEligible = true;
          } else {
            failReason = `Directs requirement failed. Has: ${activeDirectsCount}, Required: ${requiredDirects}`;
          }
        }
      } else if (planType === 'DONATION') {
        // Donation Plan logic
        const requiredSelfUpgrade = currentLogicalLevel; // Self upgrade requirement always matches the logical slot level being checked
        const currentSelfUpgrade = await getActualCompletedLevel(currentMemberId);
        
        if (activeDirectsCount >= requiredDirects && currentSelfUpgrade >= requiredSelfUpgrade) {
          isEligible = true;
        } else {
          failReason = `Condition failed. Directs [Has: ${activeDirectsCount}, Req: ${requiredDirects}]. Upgrade [Has: ${currentSelfUpgrade}, Req: ${requiredSelfUpgrade}].`;
        }
      }
    }
    
    if (isEligible) {
      receivers.push({
        logicalLevel: currentLogicalLevel,
        member: candidate,
        physicalDepth
      });
      // Slot consumed! Move to next logical slot.
      currentLogicalLevel++;
    } else {
      // SKIPPED
      skipped.push({
        memberId: candidate.memberId,
        name: candidate.name,
        failedAtLogicalLevel: currentLogicalLevel,
        reason: failReason,
        physicalDepth
      });
      // currentLogicalLevel is NOT incremented. The next physical upline will be tested for the SAME logical slot.
    }
    
    currentMemberId = candidate.sponsorId;
  }
  
  // If we reach the top (admin doesn't have sponsor) and haven't fulfilled all slots, 
  // typical MLM rule is remaining slots collapse into admin.
  // We handle admin fallback if requested.
  
  return { receivers, skipped };
};

module.exports = {
  getLogicalUplines,
  getActualCompletedLevel
};
