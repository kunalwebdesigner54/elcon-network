const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Adjust if needed
const User = require('../models/User');
const LevelIncome = require('../models/LevelIncome');
const { distributeLevelIncome } = require('../services/levelIncomeService');

async function runTests() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elcon-network-test');
  console.log('Connected to DB');

  // Clean DB
  await User.deleteMany({ memberId: { $regex: /^TEST_/ } });
  await LevelIncome.deleteMany({ joiningMemberId: { $regex: /^TEST_/ } });

  // Helper to create user
  const createUser = async (id, sponsorId, activeDirects) => {
    const u = await User.create({
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
    
    // Create direct referrals to satisfy the count
    for(let i = 0; i < activeDirects; i++) {
        await User.create({
            memberId: `${id}_DIR_${i}`,
            sponsorId: id,
            name: `Direct of ${id}`,
            email: `${id}_dir_${i}@test.com`,
            contactNo: `88888${Math.floor(Math.random() * 100000)}`,
            password: 'password',
            accountStatus: 'ACTIVE',
            isBlocked: false,
            role: 'user',
        });
    }
    return u;
  };

  try {
    // ------------------------------------------------------------------
    // TEST 1: Chain of U1 to U10.
    // We adjust the `activeDirects` parameter because the upline chain itself adds 1 direct to each sponsor.
    // e.g., U1 is a direct of U2. So U2 already has 1 direct. We add 0 more to make it 1.
    
    await createUser('TEST_U10', null, 9); // Total 10 (U9 + 9)
    await createUser('TEST_U9', 'TEST_U10', 8); // Total 9 (U8 + 8)
    await createUser('TEST_U8', 'TEST_U9', 7); // Total 8 (U7 + 7)
    await createUser('TEST_U7', 'TEST_U8', 6); // Total 7 (U6 + 6)
    await createUser('TEST_U6', 'TEST_U7', 5); // Total 6 (U5 + 5)
    await createUser('TEST_U5', 'TEST_U6', 4); // Total 5 (U4 + 4)
    await createUser('TEST_U4', 'TEST_U5', 3); // Total 4 (U3 + 3)
    await createUser('TEST_U3', 'TEST_U4', 1); // Total 2 (U2 + 1) -> U3 has only 2 directs
    await createUser('TEST_U2', 'TEST_U3', 0); // Total 1 (U1 + 0) -> U2 has only 1 direct
    await createUser('TEST_U1', 'TEST_U2', 0); // Total 1 (TEST_NEW + 0) -> U1 has 1 direct

    // New joining
    const newMember = await createUser('TEST_NEW', 'TEST_U1', 0);

    await distributeLevelIncome(newMember.memberId, newMember.name, newMember.sponsorId);

    // Verify payouts
    const incomes = await LevelIncome.find({ joiningMemberId: newMember.memberId }).sort({ level: 1 });
    console.log(`Total Payouts generated: ${incomes.length}`);
    let totalPaid = 0;
    
    for (const inc of incomes) {
        console.log(`Slot ${inc.level} paid to ${inc.recipientMemberId} amount ₹${inc.amount}`);
        totalPaid += inc.amount;
    }
    console.log(`Total Level Income Distributed: ₹${totalPaid}`);
    
    // Check wallet balances
    const u1 = await User.findOne({ memberId: 'TEST_U1' });
    console.log(`U1 Wallet Balance: ₹${u1.walletBalance} (Expected 0)`);
    
    const u2 = await User.findOne({ memberId: 'TEST_U2' });
    console.log(`U2 Wallet Balance: ₹${u2.walletBalance} (Expected 0 - Skipped for Slot 2 due to 1 direct)`);
    
    const u3 = await User.findOne({ memberId: 'TEST_U3' });
    console.log(`U3 Wallet Balance: ₹${u3.walletBalance} (Expected 18 - Got Slot 2 instead of U2)`);

    const u4 = await User.findOne({ memberId: 'TEST_U4' });
    console.log(`U4 Wallet Balance: ₹${u4.walletBalance} (Expected 18 - Got Slot 3 instead of U3)`);

    console.log('\n--- RUNNING IDEMPOTENCY TEST ---');
    // Run exactly the same again
    await distributeLevelIncome(newMember.memberId, newMember.name, newMember.sponsorId);
    const incomesRetry = await LevelIncome.find({ joiningMemberId: newMember.memberId });
    console.log(`Total Payouts after retry: ${incomesRetry.length} (Expected same as before)`);
    
    const u3Retry = await User.findOne({ memberId: 'TEST_U3' });
    console.log(`U3 Wallet Balance after retry: ₹${u3Retry.walletBalance} (Expected 18)`);

  } catch (error) {
    console.error(error);
  } finally {
    // Cleanup
    await User.deleteMany({ memberId: { $regex: /^TEST_/ } });
    await LevelIncome.deleteMany({ joiningMemberId: { $regex: /^TEST_/ } });
    await mongoose.disconnect();
    console.log('Done');
  }
}

runTests();
