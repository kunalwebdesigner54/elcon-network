const User = require('../models/User');
const RepurchaseIncome = require('../models/RepurchaseIncome');
const SiteSetting = require('../models/SiteSetting');
const { createWalletTransaction } = require('../utils/walletHelper');

const distributeRepurchaseIncome = async (order, purchaserUser, totalReserveAmount) => {
  if (!purchaserUser || !purchaserUser.sponsorId || !totalReserveAmount || totalReserveAmount <= 0) return;

  const MAX_SLOTS = 10;
  const INCOME_AMOUNT = Number((totalReserveAmount / MAX_SLOTS).toFixed(2));

  if (INCOME_AMOUNT <= 0) return;

  try {
    const planSetting = await SiteSetting.findOne({ settingKey: 'plan-setting' }).lean();
    const tdsRate = Number((planSetting?.data?.tdsCharge || '5 %').replace('%', '').trim()) / 100 || 0.05;
    const adminChargeRate = Number((planSetting?.data?.adminCharges || '5 %').replace('%', '').trim()) / 100 || 0.05;

    let currentMemberId = purchaserUser.sponsorId;
    let physicalDepth = 1;
    let successfulSlots = 0;
    const visited = new Set();
    const skippedMembersList = [];

    while (currentMemberId && successfulSlots < MAX_SLOTS) {
      if (visited.has(currentMemberId)) {
        console.warn(`Circular sponsor dependency detected at ${currentMemberId}`);
        break;
      }
      visited.add(currentMemberId);

      const candidate = await User.findOne({ memberId: currentMemberId }).lean();
      if (!candidate) break;

      const isAdmin = candidate.role === 'admin';
      const isAccountValid = isAdmin || (candidate.accountStatus === 'ACTIVE' && candidate.isBlocked === false);
      
      let isEligible = false;
      const payoutSlotLevel = successfulSlots + 1;

      if (isAccountValid) {
        if (isAdmin) {
          isEligible = true;
        } else {
          const activeDirectsCount = await User.countDocuments({
            sponsorId: currentMemberId,
            accountStatus: 'ACTIVE'
          });

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
           const tdsDeduction = Number((INCOME_AMOUNT * tdsRate).toFixed(2));
           const adminChargeDeduction = Number((INCOME_AMOUNT * adminChargeRate).toFixed(2));
           const netAmount = Number((INCOME_AMOUNT - tdsDeduction - adminChargeDeduction).toFixed(2));
           try {
            await RepurchaseIncome.create({
               recipientMemberId: currentMemberId,
               purchasingMemberId: purchaserUser.memberId,
               purchasingMemberName: purchaserUser.name,
               level: payoutSlotLevel, 
               physicalDepth: physicalDepth, 
               amount: INCOME_AMOUNT,
               orderNo: order.orderNo,
               skippedMembers: [...skippedMembersList]
             });

              await User.updateOne(
                 { memberId: currentMemberId },
                 { $inc: { walletBalance: netAmount } }
               );

              await createWalletTransaction({
                 memberId: currentMemberId,
                 description: `REPURCHASE INCOME - Level ${payoutSlotLevel}`,
                 credit: netAmount,
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
             const tdsDeduction = Number((INCOME_AMOUNT * tdsRate).toFixed(2));
             const adminChargeDeduction = Number((INCOME_AMOUNT * adminChargeRate).toFixed(2));
             const netAmount = Number((INCOME_AMOUNT - tdsDeduction - adminChargeDeduction).toFixed(2));
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
                   { $inc: { walletBalance: netAmount } }
                 );

                await createWalletTransaction({
                   memberId: admin.memberId,
                   description: `REPURCHASE INCOME - Level ${payoutSlotLevel}`,
                   credit: netAmount,
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
