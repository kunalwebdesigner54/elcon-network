require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const LevelIncome = require('../models/LevelIncome');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const records = await LevelIncome.find().sort({ createdAt: -1 }).limit(10).lean();
  
  console.log('Row | Receiver (MEMBER ID) | Trigger New Member (LEVEL ID) | FROM MEMBER NAME | Physical Depth (LEVEL DEPTH) | Amount | Transaction ID');
  console.log('-'.repeat(120));
  
  records.forEach((r, i) => {
    console.log(`${i+1} | ${r.recipientMemberId} | ${r.joiningMemberId} | ${r.joiningMemberName} | ${r.level} | ₹${r.amount} | ${r.transactionId}`);
  });
  
  process.exit(0);
}
run();
