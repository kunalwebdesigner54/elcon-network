require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const u = await User.find({ role: 'user', levelDepth: { $gt: 0 } }).select('memberId sponsorId levelDepth').limit(5).lean();
  console.log(u);
  process.exit(0);
}
run();
