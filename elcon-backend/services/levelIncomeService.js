const User = require('../models/User');
const LevelIncome = require('../models/LevelIncome');
const { getLogicalUplines } = require('./uplineEngine');

/**
 * Distribute Level Income for a newly joined member.
 * - Uses the Centralized Upline Engine
 * - Slots 2 to 10 are paid ₹20 each
 * - Slot 1 (Sponsor) gets ₹0 (skipped essentially, but it consumes Slot 1)
 * @param {String} joiningMemberId
 * @param {String} joiningMemberName
 * @param {String} sponsorId
 */
const distributeLevelIncome = async (joiningMemberId, joiningMemberName, sponsorId) => {
  if (!sponsorId) return;

  const MAX_SLOTS = 10;
  const INCOME_AMOUNT = 20;

  try {
    // 1. Get all receivers and skips from the central engine up to Logical Level 10
    const { receivers, skipped } = await getLogicalUplines(joiningMemberId, MAX_SLOTS, 'LEVEL_INCOME', 1);
    
    // 2. Iterate through the receivers and pay them (skipping level 1 since payout is 0)
    for (const receiverData of receivers) {
      const { logicalLevel, member, physicalDepth } = receiverData;
      
      if (logicalLevel === 1) {
        // Slot 1 is Sponsor. Payout is ₹0. We don't create a transaction.
        continue;
      }
      
      // Filter skipped members to only include those who failed at this specific logical slot
      const relevantSkips = skipped.filter(s => s.failedAtLogicalLevel === logicalLevel);

      // Idempotency / Duplicate Prevention:
      const existingIncome = await LevelIncome.findOne({
        joiningMemberId,
        level: logicalLevel
      });

      if (!existingIncome) {
        const transactionId = `LVL${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
        
        try {
          // Create income record
          await LevelIncome.create({
            recipientMemberId: member.memberId,
            joiningMemberId,
            joiningMemberName: joiningMemberName || '---',
            level: logicalLevel, // This is the Income Level Slot
            physicalDepth,
            amount: INCOME_AMOUNT,
            transactionId,
            skippedMembers: relevantSkips
          });

          // Credit wallet atomically
          await User.updateOne(
            { memberId: member.memberId },
            { $inc: { walletBalance: INCOME_AMOUNT } }
          );
        } catch (error) {
          if (error.code !== 11000) { // Ignore mongo duplicate key errors quietly
            console.error(`Error distributing level income for level ${logicalLevel}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Fatal error in distributeLevelIncome:', error);
  }
};

module.exports = { distributeLevelIncome };
