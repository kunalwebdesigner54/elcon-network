const User = require('../models/User');
const RepurchaseIncome = require('../models/RepurchaseIncome');
const { createWalletTransaction } = require('../utils/walletHelper');

/**
 * Distribute Repurchase Income for a product purchase order.
 * - Distributes to 10 uplines (Level 1 to Level 10).
 * - Does NOT skip the immediate sponsor (Physical Depth 1 is paid).
 * - Amount per slot = totalReserveAmount / 10.
 * - If an upline is not active, they are skipped and added to skippedMembers.
 * 
 * @param {Object} order
 * @param {String} sponsorId
 * @param {Number} totalReserveAmount
 */
const distributeRepurchaseIncome = async (order, purchaserUser, totalReserveAmount) => {
  if (!purchaserUser || !purchaserUser.sponsorId || !totalReserveAmount || totalReserveAmount <= 0) return;

  const MAX_SLOTS = 10; // 10 slots (Level 1 to 10)
  const INCOME_AMOUNT = Number((totalReserveAmount / MAX_SLOTS).toFixed(2));

  if (INCOME_AMOUNT <= 0) return;

  try {
    let currentMemberId = purchaserUser.sponsorId;
    let physicalDepth = 1;
    let successfulSlots = 0;
    const visited = new Set();
    const skippedMembersList = []; // Track skipped members

    // Loop until we have distributed 10 slots or run out of physical uplines
    while (currentMemberId && successfulSlots < MAX_SLOTS) {
      if (visited.has(currentMemberId)) {
        console.warn(`Circular sponsor dependency detected at ${currentMemberId}`);
        break;
      }
      visited.add(currentMemberId);

      const candidate = await User.findOne({ memberId: currentMemberId }).lean();
      if (!candidate) break; // Reached absolute top of tree

      const isAdmin = candidate.role === 'admin';
      const isAccountValid = isAdmin || (candidate.accountStatus === 'ACTIVE' && candidate.isBlocked === false);
      
      let isEligible = false;
      const payoutSlotLevel = successfulSlots + 1; // Slot 1 to 10

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
        const existingIncome = await RepurchaseIncome.findOne({
          orderNo: order.orderNo,
          level: payoutSlotLevel
        });

        if (!existingIncome) {
          try {
            await RepurchaseIncome.create({
              recipientMemberId: currentMemberId,
              purchasingMemberId: purchaserUser.memberId, // We might need to ensure order passes memberId
              purchasingMemberName: purchaserUser.name,
              level: payoutSlotLevel, 
              physicalDepth: physicalDepth, 
              amount: INCOME_AMOUNT,
              orderNo: order.orderNo,
              skippedMembers: [...skippedMembersList]
            });

             await User.updateOne(
               { memberId: currentMemberId },
               { $inc: { walletBalance: INCOME_AMOUNT } }
             );

             await createWalletTransaction({
               memberId: currentMemberId,
               description: `REPURCHASE INCOME CREDIT - Level ${payoutSlotLevel}`,
               credit: INCOME_AMOUNT,
             });
           } catch (error) {
            if (error.code !== 11000) {
              console.error(`Error distributing repurchase income at slot ${payoutSlotLevel}:`, error);
            }
          }
        }
        successfulSlots++;
      }

      physicalDepth++;
      currentMemberId = candidate.sponsorId;
    }

    // Admin Flush: If the tree was exhausted before 10 slots were paid out
    if (successfulSlots < MAX_SLOTS) {
      const admin = await User.findOne({ role: 'admin' }).lean();
      if (admin) {
        while (successfulSlots < MAX_SLOTS) {
          const payoutSlotLevel = successfulSlots + 1;
          
          const existingIncome = await RepurchaseIncome.findOne({
            orderNo: order.orderNo,
            level: payoutSlotLevel
          });

          if (!existingIncome) {
            try {
              await RepurchaseIncome.create({
                recipientMemberId: admin.memberId,
                purchasingMemberId: purchaserUser.memberId,
                purchasingMemberName: purchaserUser.name,
                level: payoutSlotLevel, 
                physicalDepth: physicalDepth,
                amount: INCOME_AMOUNT,
                orderNo: order.orderNo,
                skippedMembers: [...skippedMembersList]
              });

               await User.updateOne(
                 { memberId: admin.memberId },
                 { $inc: { walletBalance: INCOME_AMOUNT } }
               );

               await createWalletTransaction({
                 memberId: admin.memberId,
                 description: `REPURCHASE INCOME CREDIT (ADMIN FLUSH) - Level ${payoutSlotLevel}`,
                 credit: INCOME_AMOUNT,
               });
             } catch (error) {
              if (error.code !== 11000) {
                console.error(`Error flushing repurchase income to admin at slot ${payoutSlotLevel}:`, error);
              }
            }
          }
          successfulSlots++;
          physicalDepth++;
        }
      }
    }

  } catch (error) {
    console.error('Fatal error in distributeRepurchaseIncome:', error);
  }
};

module.exports = { distributeRepurchaseIncome };

