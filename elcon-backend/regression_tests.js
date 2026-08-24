const mongoose = require('mongoose');
const User = require('./models/User');
const LevelIncome = require('./models/LevelIncome');
const { distributeLevelIncome } = require('./services/levelIncomeService');
require('dotenv').config();

async function runTests() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('DB Connected for Regression Tests');

  // Helper to create users
  const makeUser = async (id, sponsorId, activeDirects, depth) => {
    await User.deleteOne({ memberId: id });
    await User.create({
      memberId: id,
      sponsorId: sponsorId,
      name: `Test ${id}`,
      email: `${id}@test.com`,
      password: 'password123',
      contactNo: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      accountStatus: 'ACTIVE',
      walletBalance: 0,
      levelDepth: depth
    });
    // Create dummy directs to satisfy activeDirects
    for(let i=0; i<activeDirects; i++) {
        const dId = id + '_D' + i;
        await User.deleteOne({ memberId: dId });
        await User.create({
          memberId: dId,
          name: `Direct ${dId}`,
          email: `${dId}@test.com`,
          sponsorId: id,
          password: 'password123',
          contactNo: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
          accountStatus: 'ACTIVE'
        });
    }
  };

  await User.deleteMany({ memberId: { $regex: /^TEST_/ } });
  await LevelIncome.deleteMany({ joiningMemberId: 'TEST_JOINER' });

  console.log('Seeding Test Network...');
  // T11 (Physical Upline 11)
  await makeUser('TEST_U11', 'admin', 10, 1);
  // T10
  await makeUser('TEST_U10', 'TEST_U11', 10, 2);
  await makeUser('TEST_U9', 'TEST_U10', 10, 3);
  await makeUser('TEST_U8', 'TEST_U8', 10, 4); // Wait, U8 to U8 is a loop.
  // Let's create a clear chain U11 -> U10 -> U9 -> U8 -> U7 -> U6 -> U5 -> U4 -> U3 -> U2 -> U1 -> JOINER
  
  await makeUser('TEST_U12', 'admin', 10, 1);
  await makeUser('TEST_U11', 'TEST_U12', 10, 2);
  await makeUser('TEST_U10', 'TEST_U11', 10, 3);
  await makeUser('TEST_U9', 'TEST_U10', 10, 4);
  await makeUser('TEST_U8', 'TEST_U9', 10, 5);
  await makeUser('TEST_U7', 'TEST_U8', 10, 6);
  await makeUser('TEST_U6', 'TEST_U7', 10, 7);
  await makeUser('TEST_U5', 'TEST_U6', 10, 8);
  await makeUser('TEST_U4', 'TEST_U5', 4, 9);  // Variable setup
  await makeUser('TEST_U3', 'TEST_U4', 2, 10); // Variable setup
  await makeUser('TEST_U2', 'TEST_U3', 1, 11); // Variable setup
  await makeUser('TEST_U1', 'TEST_U2', 0, 12);
  
  const resetChain = async (u2d, u3d, u4d) => {
     await LevelIncome.deleteMany({ joiningMemberId: 'TEST_JOINER' });
     await User.updateMany({ memberId: { $in: ['TEST_U2', 'TEST_U3', 'TEST_U4', 'TEST_U5', 'TEST_U6', 'TEST_U7', 'TEST_U8', 'TEST_U9', 'TEST_U10', 'TEST_U11'] } }, { $set: { walletBalance: 0 } });
     
     // Delete old dummy directs for u2, u3, u4
     await User.deleteMany({ memberId: { $regex: /^TEST_U2_D/ } });
     await User.deleteMany({ memberId: { $regex: /^TEST_U3_D/ } });
     await User.deleteMany({ memberId: { $regex: /^TEST_U4_D/ } });

     const addD = async (id, count) => {
         for(let i=0; i<count; i++) {
             const dId = `${id}_D${i}`;
             await User.create({ 
               memberId: dId, 
               name: `Direct ${dId}`,
               email: `${dId}@test.com`,
               sponsorId: id, 
               password: 'password123', 
               contactNo: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
               accountStatus: 'ACTIVE' 
             });
         }
     }
     await addD('TEST_U2', u2d);
     await addD('TEST_U3', u3d);
     await addD('TEST_U4', u4d);
  };

  const verifyIncome = async (testName, id, expectedAmt, expectedLevel) => {
      const rec = await LevelIncome.findOne({ joiningMemberId: 'TEST_JOINER', recipientMemberId: id });
      const user = await User.findOne({ memberId: id });
      const actualAmt = rec ? rec.amount : 0;
      const actualLevel = rec ? rec.level : null;
      
      let pass = true;
      if (expectedAmt > 0) {
         if (actualAmt !== expectedAmt || actualLevel !== expectedLevel || user.walletBalance !== expectedAmt) pass = false;
      } else {
         if (rec != null || user.walletBalance > 0) pass = false;
      }
      
      console.log(`[${pass ? 'PASS' : 'FAIL'}] ${testName} - ${id}: Expected ${expectedAmt} at Level ${expectedLevel}, Got ${actualAmt} at Level ${actualLevel}. Wallet: ${user.walletBalance}`);
  }

  const runScenario = async () => {
      await distributeLevelIncome('TEST_JOINER', 'Test Joiner', 'TEST_U1');
  }

  console.log('\n--- TEST 1: U2=2 directs (PASS) ---');
  await resetChain(2, 5, 5);
  await runScenario();
  await verifyIncome('Test 1', 'TEST_U1', 0, null);
  await verifyIncome('Test 1', 'TEST_U2', 20, 2);

  console.log('\n--- TEST 2: U2=1 direct (FAIL) ---');
  await resetChain(1, 5, 5);
  await runScenario();
  await verifyIncome('Test 2', 'TEST_U2', 0, null);
  await verifyIncome('Test 2', 'TEST_U3', 20, 3); // U3 gets slot 3

  console.log('\n--- TEST 3: U2=1, U3=2, U4=4 ---');
  await resetChain(1, 2, 4); // U2 fails 2, U3 fails 3, U4 passes 4
  await runScenario();
  await verifyIncome('Test 3', 'TEST_U2', 0, null);
  await verifyIncome('Test 3', 'TEST_U3', 0, null);
  await verifyIncome('Test 3', 'TEST_U4', 20, 4);

  console.log('\n--- TEST 4: U2=2, U3=2, U4=4 ---');
  await resetChain(2, 2, 4); // U2 passes 2, U3 fails 3, U4 passes 4
  await runScenario();
  await verifyIncome('Test 4', 'TEST_U2', 20, 2);
  await verifyIncome('Test 4', 'TEST_U3', 0, null);
  await verifyIncome('Test 4', 'TEST_U4', 20, 4);

  console.log('\n--- TEST 8: U10 qualifies, U11 qualifies ---');
  // From our setup, U10 has 10 directs, U11 has 10 directs.
  // U11 should NOT get paid because depth limit is 10.
  await resetChain(2, 3, 4); // U2=2, U3=3, U4=4 -> all pass up to U10
  await runScenario();
  await verifyIncome('Test 8', 'TEST_U10', 20, 10);
  await verifyIncome('Test 8', 'TEST_U11', 0, null);
  await verifyIncome('Test 8', 'TEST_U12', 0, null);

  const totalRecs = await LevelIncome.countDocuments({ joiningMemberId: 'TEST_JOINER' });
  console.log(`\nMax Payout Check: Total transactions = ${totalRecs}. Should be max 9.`);

  await mongoose.disconnect();
  process.exit(0);
}

runTests().catch(e => { console.error(e); process.exit(1); });
