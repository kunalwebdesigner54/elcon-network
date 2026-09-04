const User = require('../models/User');
const LevelIncome = require('../models/LevelIncome');
const SiteSetting = require('../models/SiteSetting');
const { createWalletTransaction } = require('../utils/walletHelper');

const distributeLevelIncome = async (joiningMemberId, joiningMemberName, sponsorId) => {
  if (!sponsorId) return;

  const MAX_SLOTS = 9;
  const INCOME_AMOUNT = 20;

  try {
    const planSetting = await SiteSetting.findOne({ settingKey: 'plan-setting' }).lean();
    const tdsRate = Number((planSetting?.data?.tdsCharge || '5 %').replace('%', '').trim()) / 100 || 0.05;
    const adminChargeRate = Number((planSetting?.data?.adminCharges || '5 %').replace('%', '').trim()) / 100 || 0.05;

    let currentMemberId = sponsorId;
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

      if (physicalDepth > 1) {
        const isAdmin = candidate.role === 'admin';
        const isAccountValid = isAdmin || (candidate.accountStatus === 'ACTIVE' && candidate.isBlocked === false);
        
        let isEligible = false;
        const payoutSlotLevel = successfulSlots + 2; 

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
          const existingIncome = await LevelIncome.findOne({
            joiningMemberId,
            level: payoutSlotLevel
          });

          if (!existingIncome) {
            const transactionId = `LVL${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
            const tdsDeduction = Number((INCOME_AMOUNT * tdsRate).toFixed(2));
            const adminChargeDeduction = Number((INCOME_AMOUNT * adminChargeRate).toFixed(2));
            const netAmount = Number((INCOME_AMOUNT - tdsDeduction - adminChargeDeduction).toFixed(2));
            
            try {
               await LevelIncome.create({
                  recipientMemberId: currentMemberId,
                  joiningMemberId,
                  joiningMemberName: joiningMemberName || '---',
                  level: payoutSlotLevel, 
                  physicalDepth: physicalDepth,
                  amount: INCOME_AMOUNT,
                  transactionId,
                  skippedMembers: [...skippedMembersList]
                });

                await User.updateOne(
                   { memberId: currentMemberId },
                   { $inc: { walletBalance: netAmount } }
                 );

                await createWalletTransaction({
                   memberId: currentMemberId,
                   description: `LEVEL INCOME - Level ${payoutSlotLevel}`,
                   credit: netAmount,
                 });

                await createWalletTransaction({
                   memberId: currentMemberId,
                   description: `TDS DEDUCTION (Level ${payoutSlotLevel})`,
                   debit: tdsDeduction,
                 });

                await createWalletTransaction({
                   memberId: currentMemberId,
                   description: `ADMIN CHARGE (Level ${payoutSlotLevel})`,
                   debit: adminChargeDeduction,
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
            const tdsDeduction = Number((INCOME_AMOUNT * tdsRate).toFixed(2));
            const adminChargeDeduction = Number((INCOME_AMOUNT * adminChargeRate).toFixed(2));
            const netAmount = Number((INCOME_AMOUNT - tdsDeduction - adminChargeDeduction).toFixed(2));
            try {
               await LevelIncome.create({
                  recipientMemberId: admin.memberId,
                  joiningMemberId,
                  joiningMemberName: joiningMemberName || '---',
                  level: payoutSlotLevel, 
                  physicalDepth: physicalDepth,
                  amount: INCOME_AMOUNT,
                  transactionId,
                  skippedMembers: [...skippedMembersList]
                });

                await User.updateOne(
                   { memberId: admin.memberId },
                   { $inc: { walletBalance: netAmount } }
                 );

                await createWalletTransaction({
                   memberId: admin.memberId,
                   description: `LEVEL INCOME - Level ${payoutSlotLevel}`,
                   credit: netAmount,
                 });

                await createWalletTransaction({
                   memberId: admin.memberId,
                   description: `TDS DEDUCTION (Level ${payoutSlotLevel})`,
                   debit: tdsDeduction,
                 });

                await createWalletTransaction({
                   memberId: admin.memberId,
                   description: `ADMIN CHARGE (Level ${payoutSlotLevel})`,
                   debit: adminChargeDeduction,
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
