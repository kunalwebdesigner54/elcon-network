const User = require('../models/User');
const LevelIncome = require('../models/LevelIncome');

/**
 * Distribute Level Income for a newly joined member.
 * - Strictly maps Physical Upline Depth to Income Slot
 * - Maximum traversal is 10 physical levels
 * - Slot 1 (Sponsor) gets ₹0 (No transaction created)
 * - Slots 2 to 10 are paid ₹20 each if they meet required direct counts
 * - Skips DO NOT shift or compress the slot upwards
 * 
 * @param {String} joiningMemberId
 * @param {String} joiningMemberName
 * @param {String} sponsorId
 */
const distributeLevelIncome = async (joiningMemberId, joiningMemberName, sponsorId) => {
  if (!sponsorId) return;

  const MAX_PHYSICAL_DEPTH = 10;
  const INCOME_AMOUNT = 20;

  try {
    let currentMemberId = sponsorId;
    let physicalDepth = 1;

    while (currentMemberId && physicalDepth <= MAX_PHYSICAL_DEPTH) {
      // 1. Fetch the candidate upline
      const candidate = await User.findOne({ memberId: currentMemberId }).lean();
      
      // If we hit the absolute top of the tree, break out.
      if (!candidate) break;

      // 2. Physical Depth 1 is the immediate sponsor. They always receive ₹0, so we just skip paying them.
      if (physicalDepth > 1) {
        
        // 3. Admin unconditionally passes checks
        const isAdmin = candidate.role === 'admin';
        const isAccountValid = isAdmin || (candidate.accountStatus === 'ACTIVE' && candidate.isBlocked === false);

        if (isAccountValid) {
          let isEligible = false;

          if (isAdmin) {
            isEligible = true;
          } else {
            // Check their Active Directs
            const activeDirectsCount = await User.countDocuments({
              sponsorId: currentMemberId,
              accountStatus: 'ACTIVE'
            });

            const requiredDirects = physicalDepth; // 1:1 mapping: Physical Depth = Required Directs

            if (activeDirectsCount >= requiredDirects) {
              isEligible = true;
            }
          }

          // 4. If Eligible, process the payout
          if (isEligible) {
            // Idempotency check: Ensure we haven't paid this member for this joiner at this level before
            const existingIncome = await LevelIncome.findOne({
              joiningMemberId,
              level: physicalDepth
            });

            if (!existingIncome) {
              const transactionId = `LVL${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
              
              try {
                // Create income record exactly matching the physical slot
                await LevelIncome.create({
                  recipientMemberId: currentMemberId,
                  joiningMemberId,
                  joiningMemberName: joiningMemberName || '---',
                  level: physicalDepth, // This is the Income Level Slot
                  physicalDepth: physicalDepth, // For historical context, now same as level
                  amount: INCOME_AMOUNT,
                  transactionId,
                  skippedMembers: [] // Removed tracking of skipped members internally to simplify
                });

                // Credit wallet atomically
                await User.updateOne(
                  { memberId: currentMemberId },
                  { $inc: { walletBalance: INCOME_AMOUNT } }
                );
              } catch (error) {
                if (error.code !== 11000) { // Ignore mongo duplicate key errors quietly
                  console.error(`Error distributing level income for physical depth ${physicalDepth}:`, error);
                }
              }
            }
          }
          // IF NOT ELIGIBLE -> DO NOTHING (No fake record, no wallet credit, no slot shifting)
        }
      }

      // 5. Advance up the physical chain for the NEXT income slot check
      physicalDepth++;
      currentMemberId = candidate.sponsorId;
    }
  } catch (error) {
    console.error('Fatal error in distributeLevelIncome:', error);
  }
};

module.exports = { distributeLevelIncome };
