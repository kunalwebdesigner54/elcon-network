// p2pbackend/seed.js

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const productSeedData = require('./data/productSeedData');

/**
 * Seed database with admin user
 * Runs on server startup to ensure admin user exists
 */
const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const defaultPassword = 'admin123';

    let adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      adminExists = await User.create({
        name: 'Admin',
        email: adminEmail,
        password: defaultPassword,
        role: 'admin',
        adminType: 'SUPER_ADMIN',
        unlockLevel: 10,
      });

      console.log('✓ Admin user seeded successfully');
      console.log(`  Email: ${adminExists.email}`);
      console.log(`  Role: ${adminExists.role}`);
      console.log(`  unlockLevel: ${adminExists.unlockLevel}`);
      return adminExists;
    }

    const needsRepair = adminExists.role !== 'admin' || adminExists.adminType !== 'SUPER_ADMIN';

    if (needsRepair) {
      adminExists.role = 'admin';
      adminExists.adminType = 'SUPER_ADMIN';
      adminExists.unlockLevel = Math.max(adminExists.unlockLevel || 0, 10);
      await adminExists.save();
      console.log('✓ Admin account repaired for login access');
    }

    if ((adminExists.unlockLevel || 0) < 10) {
      adminExists.unlockLevel = 10;
      await adminExists.save();
      console.log('✓ Admin unlockLevel updated to 10');
    }

    if (!adminExists.password || adminExists.password === '') {
      adminExists.password = defaultPassword;
      await adminExists.save();
      console.log('✓ Admin password reset to default value');
    }

    console.log('✓ Admin user already exists');
    return adminExists;
  } catch (error) {
    console.error('✗ Error seeding admin user:', error.message);
    throw error;
  }
};

const seedStarterUser = async (admin) => {
  const existingUser = await User.findOne({ email: 'user@gmail.com' });

  if (existingUser) {
    console.log('✓ Starter user already exists');
    return existingUser;
  }

  const starterUser = await User.create({
    name: 'User One',
    email: 'user@gmail.com',
    password: 'user123',
    contactNo: '9000000001',
    sponsorId: admin?.memberId,
    sponsorName: admin?.name || 'Admin',
    joiningPackage: 'Starter',
    acceptedTerms: true,
    role: 'user',
  });

  console.log('✓ Starter user seeded successfully');
  console.log(`  Email: ${starterUser.email}`);
  console.log(`  Role: ${starterUser.role}`);
  console.log(`  sponsorId: ${starterUser.sponsorId || '---'}`);
  return starterUser;
};

const seedProducts = async () => {
  const existingCount = await Product.countDocuments();

  if (existingCount > 0) {
    console.log('✓ Product catalog already exists');
    return;
  }

  await Product.insertMany(productSeedData);
  console.log(`✓ Seeded ${productSeedData.length} products`);
};

const seedCoupons = async () => {
  const existingCount = await Coupon.countDocuments();

  if (existingCount > 0) {
    console.log('✓ Coupon data already exists');
    return;
  }

  const users = await User.find({ role: 'user' }).sort({ createdAt: 1 }).limit(3);
  if (!users.length) {
    console.log('✓ Skipping coupon seed (no users found)');
    return;
  }

  const baseDate = new Date();
  const sampleCoupons = users.flatMap((user, index) => {
    const createdDate = new Date(baseDate);
    createdDate.setDate(createdDate.getDate() - (index + 1) * 30);

    const activeExpiry = new Date(baseDate);
    activeExpiry.setDate(activeExpiry.getDate() + 30);

    const usedExpiry = new Date(baseDate);
    usedExpiry.setDate(usedExpiry.getDate() + 10 - index * 2);

    const expiredExpiry = new Date(baseDate);
    expiredExpiry.setDate(expiredExpiry.getDate() - (index + 1) * 7);

    return [
      {
        couponId: `CPN${1001 + index * 3}`,
        memberId: user.memberId || `MEM${1001 + index}`,
        memberName: user.name,
        amount: 100,
        status: 'ACTIVE',
        expiryDate: activeExpiry,
        notes: 'Seeded coupon record',
      },
      {
        couponId: `CPN${1002 + index * 3}`,
        memberId: user.memberId || `MEM${1001 + index}`,
        memberName: user.name,
        amount: 100,
        status: 'USED',
        usedInOrder: `ORD${1000 + index + 1}`,
        usedDate: createdDate,
        expiryDate: usedExpiry,
        notes: 'Seeded coupon record',
      },
      {
        couponId: `CPN${1003 + index * 3}`,
        memberId: user.memberId || `MEM${1001 + index}`,
        memberName: user.name,
        amount: 100,
        status: 'EXPIRED',
        expiryDate: expiredExpiry,
        notes: 'Seeded coupon record',
      },
    ];
  });

  await Coupon.insertMany(sampleCoupons);
  console.log(`✓ Seeded ${sampleCoupons.length} coupons`);
};

/**
 * Standalone seed execution (when running via npm run seed)
 */
const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');

    const admin = await seedAdmin();
    await seedStarterUser(admin);
    await seedProducts();
    await seedCoupons();

    await mongoose.connection.close();
    console.log('✓ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seed script failed:', error.message);
    process.exit(1);
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  runSeed();
}

module.exports = seedAdmin;
