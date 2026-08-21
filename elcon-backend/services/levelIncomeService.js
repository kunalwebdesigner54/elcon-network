const User = require('../models/User');
const LevelIncome = require('../models/LevelIncome');

/**
 * Distribute Level Income (max 10 levels) for a newly joined member.
 * @param {String} joiningMemberId
 * @param {String} joiningMemberName
 * @param {String} sponsorId
 */
const distributeLevelIncome = async (joiningMemberId, joiningMemberName, sponsorId) => {
  if (!sponsorId) return;

  const MAX_LEVELS = 10;
  const INCOME_AMOUNT = 20;

  let currentSponsorId = sponsorId;
  let currentLevel = 1;
  const visited = new Set();
  
  while (currentSponsorId && currentLevel <= MAX_LEVELS) {
    if (visited.has(currentSponsorId)) {
      console.warn(`Circular sponsor dependency detected at ${currentSponsorId}`);
      break;
    }
    visited.add(currentSponsorId);

    // 1. Find the upline member
    const upline = await User.findOne({ memberId: currentSponsorId });
    if (!upline) {
      break; // Upline not found, chain broken
    }

    // Admin receives all income regardless of direct referrals
    const isAdmin = upline.role === 'admin';

    // 2. Count direct referrals of this upline (only Active members, or all members? Let's just count all registered members since that's what the system has)
    // "A direct referral means: A member whose sponsor/referrer is the current member."
    const directReferralCount = await User.countDocuments({ sponsorId: currentSponsorId });

    // 3. Check eligibility
    if (isAdmin || directReferralCount >= currentLevel) {
      // Eligible! Check if already credited (duplicate protection)
      const existingIncome = await LevelIncome.findOne({
        joiningMemberId,
        level: currentLevel,
        recipientMemberId: currentSponsorId
      });

      if (!existingIncome) {
        const transactionId = `LVL${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
        
        try {
          // Create income record
          await LevelIncome.create({
            recipientMemberId: currentSponsorId,
            joiningMemberId,
            joiningMemberName: joiningMemberName || '---',
            level: currentLevel,
            amount: INCOME_AMOUNT,
            transactionId
          });

          // Credit wallet atomically
          await User.updateOne(
            { memberId: currentSponsorId },
            { $inc: { walletBalance: INCOME_AMOUNT } }
          );
        } catch (error) {
          // If creation fails due to unique constraint, another process did it. Ignore.
          if (error.code !== 11000) {
            console.error('Error distributing level income:', error);
          }
        }
      }
    }

    // Move to next upline regardless of eligibility (skip logic)
    currentSponsorId = upline.sponsorId;
    currentLevel++;
  }
};

module.exports = { distributeLevelIncome };
