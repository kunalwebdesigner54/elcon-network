require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const LevelIncome = require('../models/LevelIncome');
const { distributeLevelIncome } = require('../services/levelIncomeService');

async function generateTestHierarchy() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB for Test Generation');

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) throw new Error('Admin not found');

    const baseId = Date.now().toString().slice(-6);
    console.log(`Generating hierarchy under Admin (ID: ${admin.memberId}) with base ID ${baseId}...`);

    const users = [];
    let currentSponsor = admin.memberId;

    for (let i = 2; i <= 10; i++) {
      const uId = `TEST_GEN_${i}_${baseId}`;
      console.log(`Creating ${uId} under ${currentSponsor}...`);
      const u = await User.create({
        memberId: uId,
        sponsorId: currentSponsor,
        name: `TEST USER LEVEL ${i}`,
        email: `${uId}@test.com`,
        contactNo: `999${i}${baseId}`,
        password: 'password',
        accountStatus: 'ACTIVE',
        isBlocked: false,
        role: 'user',
        walletBalance: 0
      });
      users.push(u);
      
      // Give them directs so they qualify for level income later!
      for (let d = 0; d < 10; d++) {
        await User.create({
          memberId: `${uId}_DIR_${d}`,
          sponsorId: uId,
          name: `Dummy Direct ${d}`,
          email: `${uId}_dir_${d}@test.com`,
          password: 'password123',
          accountStatus: 'ACTIVE',
          role: 'user'
        });
      }
      
      currentSponsor = uId;
    }

    console.log('Hierarchy created. Generating income from bottom...');
    const bottomUser = users[users.length - 1];
    
    // Bottom user adds a direct, triggering payouts up the chain!
    const triggerId = `TEST_GEN_TRIGGER_${baseId}`;
    const trigger = await User.create({
        memberId: triggerId,
        sponsorId: bottomUser.memberId,
        name: `TRIGGER JOINER`,
        email: `${triggerId}@test.com`,
        password: 'password123',
        accountStatus: 'ACTIVE',
        role: 'user'
    });

    console.log(`Triggering income for joining of ${triggerId}`);
    await distributeLevelIncome(trigger.memberId, trigger.name, trigger.sponsorId);
    console.log('Level income successfully distributed. You now have test records!');

  } catch(err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

generateTestHierarchy();
