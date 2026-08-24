require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const { distributeLevelIncome } = require('./services/levelIncomeService');
const User = require('./models/User');
const LevelIncome = require('./models/LevelIncome');

const setupTestEnvironment = async () => {
  console.log('Connecting to DB...');
  await mongoose.connect(process.env.MONGODB_URI);

  // Clear test users if any
  await User.deleteMany({ memberId: { $regex: /^TEST_/ } });
  await LevelIncome.deleteMany({ joiningMemberId: { $regex: /^TEST_/ } });

  console.log('Creating Test Upline Chain...');
  // Create a synthetic chain:
  // Admin (root)
  // U11 -> U10 -> U9 -> U8 -> U7 -> U6 -> U5 -> U4 -> U3 -> U2 -> U1 -> NEW_MEMBER
  // Let's create from top to bottom
  let prevId = null;
  const chain = [];
  
  // U15 down to U1 (15 deep to test limit beyond 10)
  for(let i = 15; i >= 1; i--) {
    const memberId = `TEST_U${i}`;
    const user = await User.create({
      memberId,
      name: `Upline ${i}`,
      email: `u${i}@test.com`,
      mobile: `90000000${i.toString().padStart(2, '0')}`,
      password: 'password',
      sponsorId: prevId || '',
      accountStatus: 'ACTIVE',
      isBlocked: false,
      levelDepth: 15 - i
    });
    chain.push(user);
    prevId = memberId;
  }

  // U1 is sponsor of NEW_MEMBER
  const newMember = await User.create({
    memberId: 'TEST_NEW_MEMBER',
    name: 'New Joiner',
    email: 'new@test.com',
    mobile: '9000000099',
    password: 'password',
    sponsorId: 'TEST_U1',
    accountStatus: 'ACTIVE',
    isBlocked: false,
    levelDepth: 15
  });

  return { chain, newMember };
};

const runTest = async () => {
  try {
    await setupTestEnvironment();

    console.log('\n--- Scenario: Normal Skip & Unlimited Traversal ---');
    // Set directs:
    // U1 = Sponsor (skipped natively)
    // U2 = 1 Direct (Requirement 2 -> SKIPPED)
    // U3 = 2 Directs (Requirement 2 -> GETS LEVEL 2)
    // U4 = 1 Direct (Requirement 3 -> SKIPPED)
    // U5 = 3 Directs (Requirement 3 -> GETS LEVEL 3)
    // U6 to U10 = 0 Directs (SKIPPED)
    // U11 = 4 Directs (Requirement 4 -> GETS LEVEL 4)
    // U12 = 5 Directs (Requirement 5 -> GETS LEVEL 5)
    // U13 = 6 Directs (Requirement 6 -> GETS LEVEL 6)
    // U14 = 7 Directs (Requirement 7 -> GETS LEVEL 7)
    // U15 = 8 Directs (Requirement 8 -> GETS LEVEL 8)
    
    // Create dummy directs to satisfy counts
    const createDirects = async (sponsorId, count) => {
      for(let i=0; i<count; i++) {
        await User.create({
          memberId: `TEST_DIRECT_${sponsorId}_${i}`,
          name: 'Dummy Direct',
          email: `dummy_${sponsorId}_${i}@test.com`,
          password: 'password',
          mobile: `800000${Math.floor(Math.random()*9000)}`,
          sponsorId: sponsorId,
          accountStatus: 'ACTIVE',
          isBlocked: false
        });
      }
    };

    await createDirects('TEST_U2', 1);
    await createDirects('TEST_U3', 2);
    await createDirects('TEST_U4', 1);
    await createDirects('TEST_U5', 3);
    await createDirects('TEST_U11', 4);
    await createDirects('TEST_U12', 5);
    await createDirects('TEST_U13', 6);
    await createDirects('TEST_U14', 7);
    await createDirects('TEST_U15', 8);

    console.log('Distributing level income for TEST_NEW_MEMBER...');
    await distributeLevelIncome('TEST_NEW_MEMBER', 'New Joiner', 'TEST_U1');

    console.log('\n--- Verify Results ---');
    const incomes = await LevelIncome.find({ joiningMemberId: 'TEST_NEW_MEMBER' }).sort('level');
    incomes.forEach(inc => {
      console.log(`Level ${inc.level} -> Paid to ${inc.recipientMemberId} (Physical Depth: ${inc.physicalDepth}) Amount: ${inc.amount}`);
    });

    console.log('\nDone.');
  } catch (error) {
    console.error(error);
  } finally {
    // Cleanup
    await User.deleteMany({ memberId: { $regex: /^TEST_/ } });
    await LevelIncome.deleteMany({ joiningMemberId: { $regex: /^TEST_/ } });
    await mongoose.connection.close();
    process.exit(0);
  }
};

runTest();
