require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const [,, requestedEmail, requestedPassword] = process.argv;
const email = (requestedEmail || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const newPassword = requestedPassword || process.env.ADMIN_PASSWORD;

const run = async () => {
  try {
    if (!email || !newPassword || newPassword.length < 6) {
      throw new Error(
        'Usage: node scripts/resetAdminPassword.js <admin-email> <new-password> (password must be at least 6 characters)'
      );
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const admin = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!admin) {
      throw new Error(`Admin user not found for email: ${email}`);
    }

    admin.password = newPassword;
    await admin.save();

    const isValid = await admin.matchPassword(newPassword);
    if (!isValid) {
      throw new Error('Password reset verification failed');
    }

    console.log(`Admin login password reset successfully for ${email}.`);
  } catch (err) {
    console.error('Error resetting admin password:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

run();
