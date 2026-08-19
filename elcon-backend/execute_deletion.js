const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for deletion script');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const runDeletion = async () => {
  await connectDB();

  try {
    // 1. Fetch all users for backup
    const allUsers = await User.find({});
    console.log(`Total users in DB before operations: ${allUsers.length}`);

    // Create backups directory if it doesn't exist
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)){
        fs.mkdirSync(backupDir);
    }

    const backupFile = path.join(backupDir, `users_backup_${Date.now()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(allUsers, null, 2));
    console.log(`\n✓ Backup successfully saved to ${backupFile}`);

    // 2. Identify USER ONE and clear sponsor relationship
    const userOne = await User.findOne({ memberId: 'EL71432550' });
    if (!userOne) {
        console.log("CRITICAL ERROR: USER ONE (EL71432550) not found in DB. Aborting deletion.");
        process.exit(1);
    }

    console.log(`\nFound USER ONE: ${userOne.name} (${userOne.memberId})`);
    
    // Unlink any sponsor from USER ONE to make them the absolute root
    userOne.sponsorId = '';
    userOne.sponsorName = '';
    await userOne.save();
    console.log(`✓ USER ONE sponsor relationship has been cleared (is now ROOT).`);

    // 3. Define deletion criteria: NOT admin, NOT User One
    const deletionFilter = {
        memberId: { $ne: 'EL71432550' },
        role: { $ne: 'admin' },
        email: { $ne: 'admin@gmail.com' }
    };

    const usersToDelete = await User.find(deletionFilter);
    console.log(`\nUsers identified for deletion: ${usersToDelete.length}`);

    if (usersToDelete.length === 0) {
        console.log("No users found to delete. Operations completed.");
        mongoose.disconnect();
        return;
    }

    // 4. Perform Deletion
    const deleteResult = await User.deleteMany(deletionFilter);
    console.log(`\n✓ Deleted exactly ${deleteResult.deletedCount} user documents from the database.`);

    // 5. Verify final state
    const remainingUsers = await User.find({});
    console.log(`\nFinal users remaining in DB: ${remainingUsers.length}`);
    remainingUsers.forEach(u => {
        console.log(`- ${u.name} (${u.role === 'admin' ? 'Admin' : u.memberId})`);
    });

  } catch (err) {
    console.error("Deletion Error:", err);
  } finally {
    mongoose.disconnect();
  }
};

runDeletion();
