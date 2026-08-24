const mongoose = require('mongoose');
const User = require('./models/User');
const LevelIncome = require('./models/LevelIncome');
const { distributeLevelIncome } = require('./services/levelIncomeService');
require('dotenv').config();

async function runTests() {
  await mongoose.connect(process.env.MONGODB_URI);

  const cleanDB = async () => {
    await User.deleteMany({ memberId: { $regex: /^TEST_/ } });
    await LevelIncome.deleteMany({ joiningMemberId: 'TEST_JOINER' });
  };
  await cleanDB();

  const makeUser = async (id, sponsorId, activeDirects, depth) => {
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
  };

  const setDirects = async (id, count) => {
     await User.deleteMany({ memberId: { $regex: new RegExp(`^${id}_D`) } });
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
  };

  // Base Chain U11 -> U10 -> U9 -> U8 -> U7 -> U6 -> U5 -> U4 -> U3 -> U2 -> U1 -> JOINER
  await makeUser('TEST_U12', 'admin', 10, 1);
  await makeUser('TEST_U11', 'TEST_U12', 10, 2);
  await makeUser('TEST_U10', 'TEST_U11', 10, 3);
  await makeUser('TEST_U9', 'TEST_U10', 10, 4);
  await makeUser('TEST_U8', 'TEST_U9', 10, 5);
  await makeUser('TEST_U7', 'TEST_U8', 10, 6);
  await makeUser('TEST_U6', 'TEST_U7', 10, 7);
  await makeUser('TEST_U5', 'TEST_U6', 10, 8);
  await makeUser('TEST_U4', 'TEST_U5', 4, 9);
  await makeUser('TEST_U3', 'TEST_U4', 2, 10);
  await makeUser('TEST_U2', 'TEST_U3', 1, 11);
  await makeUser('TEST_U1', 'TEST_U2', 0, 12);

  // Set all top nodes to have 10 directs so they naturally pass
  await setDirects('TEST_U5', 10);
  await setDirects('TEST_U6', 10);
  await setDirects('TEST_U7', 10);
  await setDirects('TEST_U8', 10);
  await setDirects('TEST_U9', 10);
  await setDirects('TEST_U10', 10);
  await setDirects('TEST_U11', 10);

  const resetChain = async (u2d, u3d, u4d) => {
     await LevelIncome.deleteMany({ joiningMemberId: 'TEST_JOINER' });
     await User.updateMany({ memberId: { $in: ['TEST_U2', 'TEST_U3', 'TEST_U4', 'TEST_U5', 'TEST_U6', 'TEST_U7', 'TEST_U8', 'TEST_U9', 'TEST_U10', 'TEST_U11'] } }, { $set: { walletBalance: 0 } });
     await setDirects('TEST_U2', u2d);
     await setDirects('TEST_U3', u3d);
     await setDirects('TEST_U4', u4d);
  };

  const verifyIncome = async (id, expectedAmt, expectedLevel) => {
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
      
      return pass ? "PASS" : "FAIL";
  }

  const runScenario = async () => {
      await distributeLevelIncome('TEST_JOINER', 'Test Joiner', 'TEST_U1');
  }

  let finalReport = "";
  const logTest = (id, result) => { finalReport += `${id} | ${result}\n`; }

  await resetChain(2, 5, 5);
  await runScenario();
  logTest('Test 1 (U2=2)', await verifyIncome('TEST_U2', 20, 2));

  await resetChain(1, 5, 5);
  await runScenario();
  logTest('Test 2 (U2=1, U3=5) - U2 Fail', await verifyIncome('TEST_U2', 0, null));
  logTest('Test 2 (U2=1, U3=5) - U3 Pass', await verifyIncome('TEST_U3', 20, 3));

  await resetChain(1, 2, 4);
  await runScenario();
  logTest('Test 3 (U2=1, U3=2, U4=4) - U4 Pass Level 4', await verifyIncome('TEST_U4', 20, 4));

  await resetChain(2, 2, 4);
  await runScenario();
  logTest('Test 4 (U2=2, U3=2, U4=4) - U2 Pass Level 2', await verifyIncome('TEST_U2', 20, 2));
  logTest('Test 4 (U2=2, U3=2, U4=4) - U3 Fail Level 3', await verifyIncome('TEST_U3', 0, null));
  logTest('Test 4 (U2=2, U3=2, U4=4) - U4 Pass Level 4', await verifyIncome('TEST_U4', 20, 4));

  await resetChain(2, 3, 4); 
  await runScenario();
  logTest('Test 8 (U10 Qualifies)', await verifyIncome('TEST_U10', 20, 10));
  logTest('Test 8 (U11 Excluded)', await verifyIncome('TEST_U11', 0, null));
  logTest('Test 8 (U12 Excluded)', await verifyIncome('TEST_U12', 0, null));

  console.log(finalReport);
  await cleanDB();
  await mongoose.disconnect();
}

runTests().catch(e => { console.error(e); process.exit(1); });
