require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const LevelIncome = require('../models/LevelIncome');
const { distributeLevelIncome } = require('../services/levelIncomeService');
const levelIncomeController = require('../controllers/levelIncomeController');

async function deepDebug() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // SETUP NEW MEMBER FOR END-TO-END TEST
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) throw new Error('Admin not found');

    const intermediateMemberId = `TEST_INT_${Date.now()}`;
    await User.create({
      memberId: intermediateMemberId,
      sponsorId: admin.memberId,
      name: 'INTERMEDIATE',
      email: `${intermediateMemberId}@test.com`,
      contactNo: `97${Math.floor(Math.random() * 100000000)}`,
      password: 'password',
      accountStatus: 'ACTIVE',
      isBlocked: false,
      role: 'user',
      walletBalance: 0
    });

    const testMemberId = `TEST_DEEP_${Date.now()}`;
    const newMember = await User.create({
      memberId: testMemberId,
      sponsorId: intermediateMemberId,
      name: 'DEEP DEBUG TESTER',
      email: `${testMemberId}@test.com`,
      contactNo: `98${Math.floor(Math.random() * 100000000)}`,
      password: 'password',
      accountStatus: 'ACTIVE',
      isBlocked: false,
      role: 'user',
      walletBalance: 0
    });

    const adminBefore = await User.findOne({ memberId: admin.memberId });
    console.log(`Admin Wallet Before: ${adminBefore.walletBalance}`);

    // TRIGGER LEVEL INCOME
    console.log('\n--- TRIGGERING LEVEL INCOME ---');
    await distributeLevelIncome(newMember.memberId, newMember.name, newMember.sponsorId);

    // FETCH NEW RECORD
    const newRecord = await LevelIncome.findOne({ joiningMemberId: testMemberId });
    
    const adminAfter = await User.findOne({ memberId: admin.memberId });
    console.log(`Admin Wallet After: ${adminAfter.walletBalance}`);
    const walletCredited = adminAfter.walletBalance - adminBefore.walletBalance;
    console.log(`Wallet Difference: ${walletCredited}`);

    console.log('\n--- DATABASE RECORD ---');
    if (newRecord) {
      console.log('New transaction exists: YES');
      console.log(`Collection: LevelIncome`);
      console.log(`Document ID: ${newRecord._id}`);
      console.log(`Amount: ${newRecord.amount}`);
      console.log(`Physical Level: ${newRecord.level}`);
      console.log(`Created At: ${newRecord.createdAt}`);
      console.log(JSON.stringify(newRecord, null, 2));
    } else {
      console.log('New transaction exists: NO (DATABASE PERSISTENCE ISSUE)');
    }

    // TEST API
    console.log('\n--- API RESPONSE ---');
    // Mock req and res
    const req = { query: {} };
    let apiData = null;
    const res = {
      status: (code) => ({
        json: (data) => { apiData = data; }
      })
    };
    await levelIncomeController.getLevelIncomeReports(req, res);

    let apiContainsRecord = false;
    if (apiData && apiData.data) {
      apiContainsRecord = apiData.data.some(r => r.levelId === testMemberId);
      console.log(`API total count: ${apiData.pagination.total}`);
      console.log(`New record in API response: ${apiContainsRecord ? 'YES' : 'NO'}`);
      if (apiContainsRecord) {
        const mappedRecord = apiData.data.find(r => r.levelId === testMemberId);
        console.log(`API Mapped Record:`);
        console.log(JSON.stringify(mappedRecord, null, 2));
      } else {
         console.log(`Records fetched:`, apiData.data.map(r => r.levelId));
      }
    } else {
       console.log('API failed to return proper data structure');
    }

    // CLEANUP
    await User.deleteOne({ memberId: testMemberId });
    await User.deleteOne({ memberId: intermediateMemberId });
    await LevelIncome.deleteMany({ joiningMemberId: testMemberId });
    await User.updateOne({ memberId: admin.memberId }, { $set: { walletBalance: adminBefore.walletBalance } });

    mongoose.disconnect();

  } catch (err) {
    console.error(err);
    mongoose.disconnect();
  }
}

deepDebug();
