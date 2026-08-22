require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const admin = await User.findOne({role: 'admin'}).lean();
  const adminId = admin ? admin.memberId : 'EL91423356';
  
  const zeroes = await User.find({ levelDepth: 0, memberId: { $ne: adminId } }).select('memberId sponsorId name createdAt levelDepth accountStatus isBlocked').lean();
  console.log('Non-admin users with depth 0:', zeroes.length);
  for (let z of zeroes) {
    console.log(z.memberId, '| Sponsor:', z.sponsorId);
  }
  
  process.exit(0);
}
run();
