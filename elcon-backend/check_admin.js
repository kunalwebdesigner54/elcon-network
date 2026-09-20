require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Donation = require('./models/Donation');
const LevelIncome = require('./models/LevelIncome');

async function checkAdminStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const admin = await User.findOne({ role: 'admin' });
    console.log('Admin levels:');
    console.log('Joining Level:', admin.joiningLevel);
    console.log('Unlock Level:', admin.unlockLevel);

    const highestDonationReceived = await Donation.find({ toMemberId: admin.memberId, status: 'COMPLETED' })
      .sort({ level: -1 })
      .limit(1);
    
    console.log('Highest Donation Received Level:', highestDonationReceived.length ? highestDonationReceived[0].level : 'None');

    const highestDonationMade = await Donation.find({ fromMemberId: admin.memberId, status: 'COMPLETED' })
      .sort({ level: -1 })
      .limit(1);

    console.log('Highest Donation Made Level:', highestDonationMade.length ? highestDonationMade[0].level : 'None');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdminStatus();
