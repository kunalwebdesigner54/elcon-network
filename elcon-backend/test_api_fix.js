const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testApiFix() {
  await mongoose.connect(process.env.MONGODB_URI);
  const adminUser = await User.findOne({ role: 'admin' }).lean();

  let rootMemberId = adminUser.memberId;
  let directsQuery = { sponsorId: rootMemberId };
  if (adminUser.role === 'admin') {
    directsQuery = {
      $or: [
        { sponsorId: rootMemberId },
        { sponsorId: "" },
        { sponsorId: null },
        { sponsorId: { $exists: false } }
      ],
      role: { $ne: 'admin' }
    };
  }
  
  const directs = await User.find(directsQuery).sort({ createdAt: 1 }).lean();
  console.log('Fixed directs count for admin:', directs.length);

  await mongoose.disconnect();
}

testApiFix().catch(console.error);
