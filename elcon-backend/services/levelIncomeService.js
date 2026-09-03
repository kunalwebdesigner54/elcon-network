const User = require('../models/User');
const LevelIncome = require('../models/LevelIncome');
const { createWalletTransaction } = require('../utils/walletHelper');

/**
 * Distribute Level Income for a newly joined member.
 * - Dynamic Compression: Distributes exactly 9 income slots (Level 2 to Level 10).
 * - Requires X Active Direct Joinings for Slot X.
 * - Searches up the physical tree infinitely until 9 slots are filled.
 * - Unpaid slots flush to the Admin account if the top of the tree is reached.
 * 
 * @param {String} joiningMemberId
 * @param {String} joiningMemberName
 * @param {String} sponsorId
 */
const distributeLevelIncome = async (joiningMemberId, joiningMemberName, sponsorId) => {
  if (!sponsorId) return;

  const MAX_SLOTS = 9; // 9 slots of 20 Rs (Level 2 to 10)
  const INCOME_AMOUNT = 20;

  try {
    let currentMemberId = sponsorId;
    let physicalDepth = 1;
    let successfulSlots = 0;
    const visited = new Set();
    const skippedMembersList = []; // Track skipped members

    // Loop until we have distributed 9 slots or run out of physical uplines
    while (currentMemberId && successfulSlots < MAX_SLOTS) {
      if (visited.has(currentMemberId)) {
        console.warn(`Circular sponsor dependency detected at ${currentMemberId}`);
        break;
      }
      visited.add(currentMemberId);

      const candidate = await User.findOne({ memberId: currentMemberId }).lean();
      if (!candidate) break; // Reached absolute top of tree

      // Physical Depth 1 is the immediate sponsor. We skip paying them.
      if (physicalDepth > 1) {
        const isAdmin = candidate.role === 'admin';
        const isAccountValid = isAdmin || (candidate.accountStatus === 'ACTIVE' && candidate.isBlocked === false);
        
        let isEligible = false;
        // Calculate which slot we are trying to fill (e.g. 1st successful payout = Level 2)
        const payoutSlotLevel = successfulSlots + 2; 

        if (isAccountValid) {
          if (isAdmin) {
            isEligible = true;
          } else {
            // Check Active Directs for normal users
            const activeDirectsCount = await User.countDocuments({
              sponsorId: currentMemberId,
              accountStatus: 'ACTIVE'
            });

            // Requirement is strictly based on the Income Slot number
            const requiredDirects = payoutSlotLevel; 

            if (activeDirectsCount >= requiredDirects) {
              isEligible = true;
            } else {
              skippedMembersList.push({ memberId: currentMemberId, reason: `Requires ${requiredDirects} active directs, has ${activeDirectsCount}` });
            }
          }
        } else {
          skippedMembersList.push({ memberId: currentMemberId, reason: !candidate.accountStatus || candidate.accountStatus !== 'ACTIVE' ? 'Account inactive' : 'Account blocked' });
        }

        if (isEligible) {
          const existingIncome = await LevelIncome.findOne({
            joiningMemberId,
            level: payoutSlotLevel
          });

          if (!existingIncome) {
            const transactionId = `LVL${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
            
            try {
              await LevelIncome.create({
                recipientMemberId: currentMemberId,
                joiningMemberId,
                joiningMemberName: joiningMemberName || '---',
                level: payoutSlotLevel, 
                physicalDepth: physicalDepth, // Record actual physical depth for transparency
                amount: INCOME_AMOUNT,
                transactionId,
                skippedMembers: [...skippedMembersList]
              });

               await User.updateOne(
                 { memberId: currentMemberId },
                 { $inc: { walletBalance: INCOME_AMOUNT } }
               );

               await createWalletTransaction({
                 memberId: currentMemberId,
                 description: `LEVEL INCOME CREDIT - Level ${payoutSlotLevel}`,
                 credit: INCOME_AMOUNT,
               });
             } catch (error) {
              if (error.code !== 11000) {
                console.error(`Error distributing level income at slot ${payoutSlotLevel}:`, error);
              }
            }
          }
          successfulSlots++;
        }
      }

      physicalDepth++;
      currentMemberId = candidate.sponsorId;
    }

    // Admin Flush: If the tree was exhausted before 9 slots were paid out
    if (successfulSlots < MAX_SLOTS) {
      const admin = await User.findOne({ role: 'admin' }).lean();
      if (admin) {
        while (successfulSlots < MAX_SLOTS) {
          const payoutSlotLevel = successfulSlots + 2;
          
          const existingIncome = await LevelIncome.findOne({
            joiningMemberId,
            level: payoutSlotLevel
          });

          if (!existingIncome) {
            const transactionId = `LVL${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
            try {
              await LevelIncome.create({
                recipientMemberId: admin.memberId,
                joiningMemberId,
                joiningMemberName: joiningMemberName || '---',
                level: payoutSlotLevel, 
                physicalDepth: physicalDepth, // Admin catches whatever depth this fell off
                amount: INCOME_AMOUNT,
                transactionId,
                skippedMembers: [...skippedMembersList]
              });

               await User.updateOne(
                 { memberId: admin.memberId },
                 { $inc: { walletBalance: INCOME_AMOUNT } }
               );

               await createWalletTransaction({
                 memberId: admin.memberId,
                 description: `LEVEL INCOME CREDIT (ADMIN FLUSH) - Level ${payoutSlotLevel}`,
                 credit: INCOME_AMOUNT,
               });
             } catch (error) {
              if (error.code !== 11000) {
                console.error(`Error flushing level income to admin at slot ${payoutSlotLevel}:`, error);
              }
            }
          }
          successfulSlots++;
          physicalDepth++;
        }
      }
    }

  } catch (error) {
    console.error('Fatal error in distributeLevelIncome:', error);
  }
};

module.exports = { distributeLevelIncome };
