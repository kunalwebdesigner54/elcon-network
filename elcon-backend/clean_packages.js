require('dotenv').config();
const mongoose = require('mongoose');
const EpinPackage = require('./models/EpinPackage');

async function cleanInactivePackages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const result = await EpinPackage.deleteMany({ isActive: false });
    console.log('Deleted inactive packages:', result.deletedCount);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanInactivePackages();
