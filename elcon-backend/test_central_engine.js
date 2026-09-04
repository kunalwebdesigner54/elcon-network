require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const { getLogicalUplines } = require('./services/uplineEngine');
const User = require('./models/User');
const Donation = require('./models/Donation');
const { distributeLevelIncome } = require('./services/levelIncomeService');
const LevelIncome = require('./models/LevelIncome');

const setupData = async () => {
  await User.deleteMany({ memberId: { $regex: /^TC_/ } });
  await Donation.deleteMany({ fromMemberId: { $regex: /^TC_/ } });
  await LevelIncome.deleteMany({ joiningMemberId: { $regex: /^TC_/ } });

  // Helper to create users
  const createUser = async (id, name, sponsorId = null, directs = 0, upgradeLvl = 0) => {
    const user = await User.create({
      memberId: id,
      name,
      email: `${id}@test.com`,
      password: 'password',
      mobile: `700000${Math.floor(Math.random()*9000)}`,
      sponsorId,
      accountStatus: 'ACTIVE',
      isBlocked: false,
      walletBalance: 0
    });
    
    // Create directs
    for(let i=0; i<directs; i++) {
      await User.create({
        memberId: `${id}_D${i}`,
        name: 'Dir',
        email: `${id}_D${i}@test.com`,
        password: 'password',
        mobile: `700000${Math.floor(Math.random()*9000)}`,
        sponsorId: id,
        accountStatus: 'ACTIVE'
      });
    }

    // Create dummy donations to simulate upgrade level
    if (upgradeLvl > 0) {
      for(let i=1; i<=upgradeLvl; i++) {
        await Donation.create({
          donationId: `DON_${id}_${i}`,
          fromMemberId: id,
          toMemberId: 'ADMIN',
          amount: 100,
          level: i,
          status: 'APPROVED'
        });
      }
    }
    return user;
  };

  return { createUser };
};

const runTests = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const { createUser } = await setupData();

    console.log('--- TEST 1, 2, 3: Basic Donation Conditions ---');
    await createUser('TC_U3', 'U3', null, 1, 2); // 1 dummy + TC_U2 = 2 directs. Qualifies L2. Upgrade=2
    await createUser('TC_U2', 'U2', 'TC_U3', 0, 2); // 0 dummy + TC_U1 = 1 direct. Fails L2. Upgrade=2
    await createUser('TC_U1', 'U1', 'TC_U2', 1, 1); // 1 dummy + TC_NEW = 2 directs. Qualifies L1. Upgrade=1
    await createUser('TC_NEW', 'New', 'TC_U1', 0, 0); 

    // Find Level 2 receiver for TC_NEW
    const resA = await getLogicalUplines('TC_NEW', 2, 'DONATION', 1);
    
    // Logical level 1 should be U1 (wait, U1 needs 1 direct, 1 upgrade... U1 has 2 directs, 1 upgrade! So U1 qualifies for Level 1)
    // Logical level 2 should be checked on U2. U2 has 1 direct, 2 upgrade. Fails direct. Skips.
    // Logical level 2 should be checked on U3. U3 has 2 directs, 2 upgrade. Qualifies!
    const l1 = resA.receivers.find(r => r.logicalLevel === 1);
    const l2 = resA.receivers.find(r => r.logicalLevel === 2);
    
    console.log(`Logical Level 1 Receiver: ${l1 ? l1.member.memberId : 'None'} (Expected TC_U1)`);
    console.log(`Logical Level 2 Receiver: ${l2 ? l2.member.memberId : 'None'} (Expected TC_U3)`);
    console.log(`Skips at Level 2: ${resA.skipped.filter(s => s.failedAtLogicalLevel === 2).map(s => s.memberId).join(', ')} (Expected TC_U2)`);

    console.log('\n--- TEST 5, 6, 7: Level Income Skipped Cascade ---');
    await createUser('TC_U6', 'U6', null, 2, 0); // 2 dummy + U5 = 3 directs. Qualifies L3.
    await createUser('TC_U5', 'U5', 'TC_U6', 1, 0); // 1 dummy + U4 = 2 directs. Fails L3. Qualifies L2.
    await createUser('TC_U4', 'U4', 'TC_U5', 0, 0); // 0 dummy + NEW2 = 1 direct. (Gets L1 auto-qualify)
    await createUser('TC_NEW2', 'New2', 'TC_U4', 0, 0);
    
    const resB = await getLogicalUplines('TC_NEW2', 3, 'LEVEL_INCOME', 1);
    const li1 = resB.receivers.find(r => r.logicalLevel === 1); // Auto qualifies (TC_U4)
    const li2 = resB.receivers.find(r => r.logicalLevel === 2); // U5 has 2 directs -> qualifies Level 2
    const li3 = resB.receivers.find(r => r.logicalLevel === 3); // U6 has 3 directs -> qualifies Level 3
    
    console.log(`Level Income L1 (₹0): ${li1 ? li1.member.memberId : 'None'} (Expected TC_U4)`);
    console.log(`Level Income L2 (₹20): ${li2 ? li2.member.memberId : 'None'} (Expected TC_U5)`);
    console.log(`Level Income L3 (₹20): ${li3 ? li3.member.memberId : 'None'} (Expected TC_U6)`);

    console.log('\n--- TEST 8, 9, 10, 11: Level 10 Donation Condition ---');
    await createUser('TC_10A', 'U10A', null, 14, 10); // 14 dummy + 1 = 15 directs. Qualifies L10.
    await createUser('TC_10B', 'U10B', 'TC_10A', 9, 9); // 9 dummy + 1 = 10 directs. Fails L10 (Upgrade is 9).
    await createUser('TC_10C', 'U10C', 'TC_10B', 8, 10); // 8 dummy + 1 = 9 directs. Fails L10 (Directs is 9).
    await createUser('TC_10D', 'U10D', 'TC_10C', 9, 10); // 9 dummy + 0 = 9 directs (but not in chain above 10C for traversal)
    
    // We can simulate starting checking directly for Logical Level 10 to isolate tests
    const resC = await getLogicalUplines('TC_10C', 10, 'DONATION', 10);
    const l10Receiver = resC.receivers.find(r => r.logicalLevel === 10);
    console.log(`Level 10 Receiver: ${l10Receiver ? l10Receiver.member.memberId : 'None'} (Expected TC_10A)`);
    console.log(`Level 10 Skips: ${resC.skipped.filter(s => s.failedAtLogicalLevel === 10).map(s => s.memberId).join(', ')} (Expected TC_10B)`);

    console.log('\n--- TEST 12: Duplicate Processing ---');
    await distributeLevelIncome('TC_NEW2', 'New2', 'TC_U4');
    await distributeLevelIncome('TC_NEW2', 'New2', 'TC_U4'); // Trigger again
    
    const countLvl2 = await LevelIncome.countDocuments({ joiningMemberId: 'TC_NEW2', level: 2 });
    const u5 = await User.findOne({ memberId: 'TC_U5' });
    console.log(`Duplicate Check: Lvl 2 records created: ${countLvl2} (Expected 1)`);
    console.log(`U5 Wallet Balance: ${u5.walletBalance} (Expected 18)`);
    
    console.log('\nALL TESTS EXECUTED.');
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runTests();
