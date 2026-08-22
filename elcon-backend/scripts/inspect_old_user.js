require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const oldUser = await User.findOne({ role: 'user' }).sort({ createdAt: 1 }).lean();
  console.log(oldUser);
  process.exit(0);
}
run();
