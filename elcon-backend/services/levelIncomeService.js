const User = require('../models/User');
const LevelIncome = require('../models/LevelIncome');

/**
 * Distribute Level Income for a newly joined member.
 * - Max 9 payouts (Slot 2 to Slot 10)
 * - ₹20 per slot
 * - 1st Upline gets ₹0 (skipped)
 * - Requires X Active Direct Joinings for Slot X
 * @param {String} joiningMemberId
 * @param {String} joiningMemberName
 * @param {String} sponsorId
 */
const distributeLevelIncome = async (joiningMemberId, joiningMemberName, sponsorId) => {
  if (!sponsorId) return;

  const MAX_PHYSICAL_DEPTH = 10;
  const MAX_SLOTS = 9;
  const INCOME_AMOUNT = 20;

  try {
    let currentSponsorId = sponsorId; // Starts at U1
    let physicalDepth = 0;
    let successfulSlots = 0;
    const visited = new Set();
    
    while (currentSponsorId && physicalDepth < MAX_PHYSICAL_DEPTH && successfulSlots < MAX_SLOTS) {
      if (visited.has(currentSponsorId)) {
        console.warn(`Circular sponsor dependency detected at ${currentSponsorId}`);
        break;
      }
      visited.add(currentSponsorId);

      physicalDepth++;

      // Find the current upline in the chain
      const upline = await User.findOne({ memberId: currentSponsorId });
      
      // If U1 (Sponsor), skip payment but move to next upline
      if (physicalDepth === 1) {
        currentSponsorId = upline ? upline.sponsorId : null;
        continue;
      }

      if (!upline) {
        break; // Upline not found, chain broken
      }

      const isAdmin = upline.role === 'admin';
      const isUplineValid = isAdmin || (upline.accountStatus === 'ACTIVE' && upline.isBlocked === false);

      const requiredDirects = successfulSlots + 2; // Slot requirement is based on successful payouts
      let isEligible = false;

      // Check eligibility (Enforce requirements on ALL members including Admin)
      if (isUplineValid) {
        // Count ACTIVE and unblocked direct referrals for this upline
        // Use $ne to handle older documents that might be missing these fields in MongoDB
        const activeDirectsCount = await User.countDocuments({
          sponsorId: currentSponsorId,
          accountStatus: { $ne: 'IN-ACTIVE' },
          isBlocked: { $ne: true },
        });

        if (activeDirectsCount >= requiredDirects) {
          isEligible = true;
        }

        console.log(`[TRACE] Member: ${currentSponsorId} | Physical Depth: ${physicalDepth} | Successful Slot: ${successfulSlots + 2} | Req Directs: ${requiredDirects} | Act Directs: ${activeDirectsCount} | Status: ${isEligible ? 'QUALIFIED' : 'SKIPPED'} | Payout: ${isEligible ? '₹20' : '₹0'}`);
      }

      // If eligible, process the payout
      if (isEligible) {
        // Record the contiguous slot for UI/DB (starts at 2)
        const payoutLevel = successfulSlots + 2;
        
        // Idempotency / Duplicate Prevention:
        const existingIncome = await LevelIncome.findOne({
          joiningMemberId,
          level: payoutLevel
        });

        // If not already paid, distribute it
        if (!existingIncome) {
          const transactionId = `LVL${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
          
          try {
            // 1. Create income record
            await LevelIncome.create({
              recipientMemberId: currentSponsorId,
              joiningMemberId,
              joiningMemberName: joiningMemberName || '---',
              level: payoutLevel,
              physicalDepth,
              amount: INCOME_AMOUNT,
              transactionId
            });

            // 2. Credit wallet atomically
            await User.updateOne(
              { memberId: currentSponsorId },
              { $inc: { walletBalance: INCOME_AMOUNT } }
            );
          } catch (error) {
            if (error.code !== 11000) {
              console.error(`Error distributing level income for level ${payoutLevel}:`, error);
            }
          }
        }
        
        successfulSlots++;
      }

      // Move to next physical upline (whether current was eligible or skipped)
      currentSponsorId = upline.sponsorId;
    }
  } catch (error) {
    console.error('Fatal error in distributeLevelIncome:', error);
  }
};

module.exports = { distributeLevelIncome };
