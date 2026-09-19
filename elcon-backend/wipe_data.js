const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const LevelIncome = require('./models/LevelIncome');
const RepurchaseIncome = require('./models/RepurchaseIncome');
const WalletTransaction = require('./models/WalletTransaction');
const DiscountWalletTransaction = require('./models/DiscountWalletTransaction');
const WithdrawalRequest = require('./models/WithdrawalRequest');
const DepositRequest = require('./models/DepositRequest');
const Epin = require('./models/Epin');
const EpinRequest = require('./models/EpinRequest');
const EpinTransfer = require('./models/EpinTransfer');
const SupportTicket = require('./models/SupportTicket');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const Donation = require('./models/Donation');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for Full Data Wipe');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const runWipe = async () => {
  await connectDB();

  try {
    // 1. Wipe Users except Admin and User One (EL71432550)
    const deletionFilter = {
        memberId: { $ne: 'EL71432550' },
        role: { $ne: 'admin' },
        email: { $ne: 'admin@gmail.com' }
    };

    const deleteResult = await User.deleteMany(deletionFilter);
    console.log(`✓ Deleted ${deleteResult.deletedCount} user documents.`);

    // 2. Clear sponsor for User One
    const userOne = await User.findOne({ memberId: 'EL71432550' });
    if (userOne) {
        userOne.sponsorId = '';
        userOne.sponsorName = '';
        userOne.directCount = 0;
        userOne.totalTeamCount = 0;
        userOne.walletBalance = 0;
        userOne.couponWalletBalance = 0;
        userOne.discountCouponBalance = 0;
        await userOne.save();
        console.log(`✓ USER ONE (EL71432550) reset to root with 0 balances and team.`);
    }

    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
        adminUser.directCount = 0;
        adminUser.totalTeamCount = 0;
        adminUser.walletBalance = 0;
        await adminUser.save();
        console.log(`✓ ADMIN reset team counts and wallet balances.`);
    }

    // 3. Wipe all transactional/history collections
    console.log(`Wiping transactional collections...`);
    
    const collectionsToWipe = [
        { model: LevelIncome, name: 'LevelIncome' },
        { model: RepurchaseIncome, name: 'RepurchaseIncome' },
        { model: WalletTransaction, name: 'WalletTransaction' },
        { model: DiscountWalletTransaction, name: 'DiscountWalletTransaction' },
        { model: WithdrawalRequest, name: 'WithdrawalRequest' },
        { model: DepositRequest, name: 'DepositRequest' },
        { model: Epin, name: 'Epin' },
        { model: EpinRequest, name: 'EpinRequest' },
        { model: EpinTransfer, name: 'EpinTransfer' },
        { model: SupportTicket, name: 'SupportTicket' },
        { model: Order, name: 'Order' },
        { model: Cart, name: 'Cart' },
        { model: Donation, name: 'Donation' }
    ];

    for (const coll of collectionsToWipe) {
        const res = await coll.model.deleteMany({});
        console.log(`  - Deleted ${res.deletedCount} documents from ${coll.name}`);
    }

    console.log(`\nData Wipe Completed Successfully! (Products, Packages, Settings were kept)`);
    
    // Verify final state
    const remainingUsers = await User.find({});
    console.log(`\nFinal users remaining in DB: ${remainingUsers.length}`);
    remainingUsers.forEach(u => {
        console.log(`- ${u.name} (${u.role === 'admin' ? 'Admin' : u.memberId})`);
    });

  } catch (err) {
    console.error("Wipe Error:", err);
  } finally {
    mongoose.disconnect();
  }
};

runWipe();
