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

  const MAX_SLOT = 10;
  const INCOME_AMOUNT = 20;

  try {
    // 1. Get immediate sponsor (1st Upline). They are skipped for Level Income.
    const immediateSponsor = await User.findOne({ memberId: sponsorId });
    if (!immediateSponsor || !immediateSponsor.sponsorId) {
      return; // No further upline to pay
    }

    let currentSponsorId = immediateSponsor.sponsorId;
    let currentSlot = 2; // Payout starts from Slot 2
    const visited = new Set();
    
    // Continue traversing until we hit the maximum slot or run out of uplines
    while (currentSponsorId && currentSlot <= MAX_SLOT) {
      if (visited.has(currentSponsorId)) {
        console.warn(`Circular sponsor dependency detected at ${currentSponsorId}`);
        break;
      }
      visited.add(currentSponsorId);

      // Find the current upline in the chain
      const upline = await User.findOne({ memberId: currentSponsorId });
      if (!upline) {
        break; // Upline not found, chain broken
      }

      const isAdmin = upline.role === 'admin';
      const isUplineValid = isAdmin || (upline.accountStatus === 'ACTIVE' && upline.isBlocked === false);

      let isEligible = false;

      // Check eligibility
      if (isAdmin) {
        isEligible = true; // Admin gets everything
      } else if (isUplineValid) {
        // Count ACTIVE and unblocked direct referrals for this upline
        const activeDirectsCount = await User.countDocuments({
          sponsorId: currentSponsorId,
          accountStatus: 'ACTIVE',
          isBlocked: false,
        });

        // Slot requirement: Slot N needs N direct active joinings
        if (activeDirectsCount >= currentSlot) {
          isEligible = true;
        }
      }

      // If eligible, process the payout for this slot
      if (isEligible) {
        // Idempotency / Duplicate Prevention:
        // Check if THIS joining event has already paid out THIS specific slot.
        const existingIncome = await LevelIncome.findOne({
          joiningMemberId,
          level: currentSlot // We store the payout slot as 'level'
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
              level: currentSlot, // The slot number (2 to 10)
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
              console.error(`Error distributing level income for slot ${currentSlot}:`, error);
            }
          }
        }
        
        // Slot is fulfilled (either just paid or previously paid in a retry).
        // Move requirement to the NEXT slot.
        currentSlot++;
      }

      // Move to next upline (whether current was eligible or skipped)
      currentSponsorId = upline.sponsorId;
    }
  } catch (error) {
    console.error('Fatal error in distributeLevelIncome:', error);
  }
};

module.exports = { distributeLevelIncome };
