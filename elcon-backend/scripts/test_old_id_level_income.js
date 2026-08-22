require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const LevelIncome = require('../models/LevelIncome');
const { distributeLevelIncome } = require('../services/levelIncomeService');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Pick any old user
  let eligibleOldUser = await User.findOne({ role: 'user', memberId: { $ne: 'EL12345678' } }).sort({ createdAt: 1 });
  
  if (!eligibleOldUser) {
     console.log("No old user found!");
     process.exit(1);
  }

  console.log('\nSelected Eligible Old User: ' + eligibleOldUser.name + ' (' + eligibleOldUser.memberId + ')');
  
  // Make sure they have at least 2 active directs so they are eligible for U2 income
  const directsCount = await User.countDocuments({ sponsorId: eligibleOldUser.memberId });
  if (directsCount < 2) {
      console.log(`They only have ${directsCount} directs. Creating up to 2 active directs for them...`);
      for (let i = directsCount; i < 2; i++) {
        await User.create({
          name: 'Test Direct ' + i,
          email: 'testdirect' + Date.now() + '_' + i + '@test.com',
          password: 'hashed_password',
          sponsorId: eligibleOldUser.memberId,
          memberId: 'EL_TEST_' + Date.now() + '_' + i,
        });
      }
  }

  // The fields accountStatus and isBlocked default to ACTIVE and false for the newly created ones.
  // But let's unset them for the eligibleOldUser to SIMULATE a legacy user missing these fields!
  await User.collection.updateOne(
     { _id: eligibleOldUser._id },
     { $unset: { accountStatus: "", isBlocked: "" } }
  );

  console.log('Unset accountStatus and isBlocked on old user to simulate legacy document.');

  // Refetch to see initial wallet
  eligibleOldUser = await User.findOne({ _id: eligibleOldUser._id });
  const initialWallet = eligibleOldUser.walletBalance || 0;
  console.log('Initial Wallet Balance: ₹' + initialWallet);

  // Now create U1 under eligibleOldUser
  const u1Id = 'U1_' + Date.now();
  await User.create({
    name: 'Test U1',
    email: 'testu1' + Date.now() + '@test.com',
    password: 'hashed_password',
    sponsorId: eligibleOldUser.memberId,
    memberId: u1Id,
  });

  // Create New Member under U1
  const newMemberId = 'NEW_' + Date.now();
  const newMemberName = 'NEW JOINING FOR OLD ID';
  await User.create({
    name: newMemberName,
    email: 'newjoin' + Date.now() + '@test.com',
    password: 'hashed_password',
    sponsorId: u1Id,
    memberId: newMemberId,
  });

  console.log('\nTriggering distributeLevelIncome for New Member: ' + newMemberId + ' with Sponsor U1: ' + u1Id + '...');
  await distributeLevelIncome(newMemberId, newMemberName, u1Id);

  const updatedOldUser = await User.findOne({ memberId: eligibleOldUser.memberId });
  console.log('\nUpdated Wallet Balance: ₹' + updatedOldUser.walletBalance);
  console.log('Wallet Difference: ₹' + (updatedOldUser.walletBalance - initialWallet));

  if (updatedOldUser.walletBalance - initialWallet === 20) {
    console.log('SUCCESS! Old user received ₹20 wallet credit!');
  } else {
    console.log('FAILURE! Old user did NOT receive the wallet credit.');
  }

  const incomeRecords = await LevelIncome.find({ recipientMemberId: eligibleOldUser.memberId, joiningMemberId: newMemberId }).lean();
  console.log('\nLevel Income Records created for this transaction:');
  console.log(incomeRecords);

  if (incomeRecords.length > 0) {
    console.log('SUCCESS! Level income record was correctly created!');
  } else {
    console.log('FAILURE! Level income record was NOT created.');
  }

  process.exit(0);
}
run();
