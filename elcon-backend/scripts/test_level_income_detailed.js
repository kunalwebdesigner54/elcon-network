const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const User = require('../models/User');
const LevelIncome = require('../models/LevelIncome');
const { distributeLevelIncome } = require('../services/levelIncomeService');

async function runDetailedTest() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elcon-network-test');
  console.log('Connected to DB for Detailed Test');

  // Clean DB for TEST_ users
  await User.deleteMany({ memberId: { $regex: /^TEST_/ } });
  await LevelIncome.deleteMany({ joiningMemberId: { $regex: /^TEST_/ } });

  // Helper to create a user
  const createBaseUser = async (id, sponsorId) => {
    return await User.create({
      memberId: id,
      sponsorId,
      name: `User ${id}`,
      email: `${id}@test.com`,
      contactNo: `99999${Math.floor(Math.random() * 100000)}`,
      password: 'password',
      accountStatus: 'ACTIVE',
      isBlocked: false,
      role: 'user',
      walletBalance: 0
    });
  };

  try {
    // We create the chain from top to bottom
    await createBaseUser('TEST_U10', null);
    await createBaseUser('TEST_U9', 'TEST_U10');
    await createBaseUser('TEST_U8', 'TEST_U9');
    await createBaseUser('TEST_U7', 'TEST_U8');
    await createBaseUser('TEST_U6', 'TEST_U7');
    await createBaseUser('TEST_U5', 'TEST_U6');
    await createBaseUser('TEST_U4', 'TEST_U5');
    await createBaseUser('TEST_U3', 'TEST_U4');
    await createBaseUser('TEST_U2', 'TEST_U3');
    await createBaseUser('TEST_U1', 'TEST_U2');
    
    // New joining
    const newMember = await createBaseUser('TEST_NEW', 'TEST_U1');

    // Target directs configuration
    const targetDirects = {
      'TEST_U1': 10,
      'TEST_U2': 1,
      'TEST_U3': 3,
      'TEST_U4': 2,
      'TEST_U5': 5,
      'TEST_U6': 4,
      'TEST_U7': 7,
      'TEST_U8': 8,
      'TEST_U9': 6,
      'TEST_U10': 10,
    };

    // Fulfill target directs by adding dummy users
    console.log('Setting up exact Active Direct Joinings...');
    for (const [userId, target] of Object.entries(targetDirects)) {
      const currentDirects = await User.countDocuments({ sponsorId: userId });
      const needed = target - currentDirects;
      
      for(let i = 0; i < needed; i++) {
        await createBaseUser(`${userId}_DUMMY_${i}`, userId);
      }
      
      const finalCount = await User.countDocuments({ sponsorId: userId });
      console.log(`${userId} setup with exactly ${finalCount} Active Direct Joinings.`);
    }

    console.log('\n--- TRIGGERING LEVEL INCOME DISTRIBUTION ---');
    await distributeLevelIncome(newMember.memberId, newMember.name, newMember.sponsorId);

    console.log('\n--- VERIFICATION REPORT ---');
    
    // U1 Check
    const u1 = await User.findOne({ memberId: 'TEST_U1' });
    console.log(`\nU1 (1st Sponsor) Check:`);
    console.log(`Directs: 10`);
    console.log(`Wallet Balance: ₹${u1.walletBalance} (Expected: ₹0 because 1st sponsor is skipped)`);

    console.log(`\n--- TRAVERSAL & SLOT PAYOUT SIMULATION ---`);
    const incomes = await LevelIncome.find({ joiningMemberId: newMember.memberId }).sort({ level: 1 });
    
    let currentSlot = 2;
    let uplineChain = ['TEST_U2', 'TEST_U3', 'TEST_U4', 'TEST_U5', 'TEST_U6', 'TEST_U7', 'TEST_U8', 'TEST_U9', 'TEST_U10'];
    let paidCount = 0;
    
    // Detailed trace
    for (const uplineId of uplineChain) {
        if (currentSlot > 10) break;
        
        const directs = targetDirects[uplineId];
        console.log(`\nEvaluating ${uplineId} for Slot ${currentSlot} (Required: ${currentSlot} Directs):`);
        console.log(`- ${uplineId} has ${directs} Direct Active Joinings.`);
        
        if (directs >= currentSlot) {
            console.log(`- ELIGIBLE: ${uplineId} gets ₹20 for Slot ${currentSlot}.`);
            currentSlot++;
            paidCount++;
        } else {
            console.log(`- NOT ELIGIBLE: ${uplineId} is SKIPPED.`);
        }
    }

    console.log('\n--- ACTUAL DATABASE DISTRIBUTION TABLE ---');
    let totalPaid = 0;
    if (incomes.length === 0) {
        console.log('No payouts found.');
    } else {
        incomes.forEach(inc => {
            console.log(`Slot ${inc.level}: ₹${inc.amount} paid to ${inc.recipientMemberId} | TxID: ${inc.transactionId} | Time: ${inc.createdAt}`);
            totalPaid += inc.amount;
        });
    }
    
    console.log(`\nTotal Slots Paid: ${incomes.length}`);
    console.log(`Total Money Distributed: ₹${totalPaid}`);

    if (incomes.length < 9) {
        console.log(`\nNote: Only ${incomes.length} slots were paid instead of 9. This is because the upline chain ended before all 9 slots could be fulfilled. The remaining ₹${(9 - incomes.length) * 20} is NOT distributed and remains safe.`);
    }

  } catch (error) {
    console.error(error);
  } finally {
    // Cleanup
    await User.deleteMany({ memberId: { $regex: /^TEST_/ } });
    await LevelIncome.deleteMany({ joiningMemberId: { $regex: /^TEST_/ } });
    await mongoose.disconnect();
    console.log('\nDone');
  }
}

runDetailedTest();
