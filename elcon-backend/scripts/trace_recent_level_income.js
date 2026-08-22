require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const LevelIncome = require('../models/LevelIncome');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const lastRecord = await LevelIncome.findOne().sort({ createdAt: -1 });
  if (!lastRecord) return console.log('No records found');

  const joiningId = lastRecord.joiningMemberId;
  console.log('Most recent joining ID:', joiningId, `(Name: ${lastRecord.joiningMemberName})`);

  const records = await LevelIncome.find({ joiningMemberId: joiningId }).sort({ level: 1 }).lean();
  console.log('Payouts generated:', records.length);
  console.log(records.map(r => ({ level: r.level, amount: r.amount, recipient: r.recipientMemberId })));

  const newMember = await User.findOne({ memberId: joiningId });
  if (!newMember) {
     console.log('New member not found in users collection!');
     process.exit(1);
  }

  console.log('\nTracing uplines for', newMember.memberId);
  let current = newMember.sponsorId;
  let depth = 0;

  while (current && depth < 10) {
    depth++;
    const upline = await User.findOne({ memberId: current });
    if (!upline) {
       console.log(`U${depth}: ${current} | NOT FOUND IN DB`);
       break;
    }

    const activeDirects = await User.countDocuments({
       sponsorId: current,
       accountStatus: { $ne: 'IN-ACTIVE' },
       isBlocked: { $ne: true }
    });

    const isEligible = upline.role === 'admin' || activeDirects >= depth;
    console.log(`U${depth}: ${current} | Admin: ${upline.role === 'admin'} | Directs: ${activeDirects} | Required: ${depth} | Eligible: ${isEligible}`);

    current = upline.sponsorId;
  }

  process.exit(0);
}

run();
