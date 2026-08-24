const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkSponsors() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('DB connected');

  const users = await User.find({ role: 'user' }).limit(5).select('memberId sponsorId').lean();
  console.log('Sample users:', JSON.stringify(users, null, 2));

  const admin = await User.findOne({ role: 'admin' }).select('memberId').lean();
  console.log('Admin:', admin);

  const directs = await User.countDocuments({ sponsorId: admin.memberId });
  console.log(`Directs for Admin ${admin.memberId}:`, directs);

  // Check if they are stored as case insensitive or different
  const directsIgnoreCase = await User.countDocuments({ sponsorId: new RegExp(`^${admin.memberId}$`, 'i') });
  console.log(`Directs for Admin (Regex i):`, directsIgnoreCase);

  await mongoose.disconnect();
}

checkSponsors().catch(console.error);
