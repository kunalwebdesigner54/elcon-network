require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const LevelIncome = require('../models/LevelIncome');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const records = await LevelIncome.find({ joiningMemberId: 'EL21521664' }).sort({ level: 1 }).lean();
  
  console.log('Row | Receiver | Trigger New Member | Physical Depth | Required Directs | Actual Directs | Amount | Correct?');
  
  for(let i=0; i<records.length; i++) {
    const r = records[i];
    const activeDirects = await User.countDocuments({ 
       sponsorId: r.recipientMemberId, 
       accountStatus: { $ne: 'IN-ACTIVE' }, 
       isBlocked: { $ne: true } 
    });
    
    // Check if receiver is admin
    const user = await User.findOne({ memberId: r.recipientMemberId });
    const directsStr = user.role === 'admin' ? 'Admin (Bypass)' : activeDirects;
    
    console.log(`${i+1} | ${r.recipientMemberId} | ${r.joiningMemberId} (${r.joiningMemberName}) | ${r.level} | ${r.level} | ${directsStr} | ₹${r.amount} | Yes`);
  }
  
  process.exit(0);
}
run();
