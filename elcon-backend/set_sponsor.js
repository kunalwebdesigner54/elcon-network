const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for Sponsor Update');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const runUpdate = async () => {
  await connectDB();

  try {
    const userOne = await User.findOne({ memberId: 'EL71432550' });
    if (userOne) {
        userOne.sponsorId = 'admin';
        userOne.sponsorName = 'Admin';
        userOne.joiningLevel = 1; 
        await userOne.save();
        console.log(`✓ USER ONE (EL71432550) sponsor set to admin.`);
    }

    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
        adminUser.directCount = 1;
        adminUser.totalTeamCount = 1;
        await adminUser.save();
        console.log(`✓ ADMIN counts incremented to 1.`);
    }

  } catch (err) {
    console.error("Update Error:", err);
  } finally {
    mongoose.disconnect();
  }
};

runUpdate();
