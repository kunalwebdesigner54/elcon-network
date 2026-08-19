const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Cart = require('./models/Cart');
const DepositRequest = require('./models/DepositRequest');
const Donation = require('./models/Donation');
const Epin = require('./models/Epin');
const EpinFranchise = require('./models/EpinFranchise');
const EpinRequest = require('./models/EpinRequest');
const EpinTransfer = require('./models/EpinTransfer');
const Order = require('./models/Order');
const SupportTicket = require('./models/SupportTicket');
const WithdrawalRequest = require('./models/WithdrawalRequest');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const runAnalysis = async () => {
  await connectDB();

  try {
    const adminUser = await User.findOne({ role: 'admin' });
    const userOne = await User.findOne({ memberId: 'EL71432550' });

    console.log("=== USER PRE-CHECK ===");
    console.log("Admin User found:", adminUser ? adminUser.email : 'No');
    console.log("User One (EL71432550) found:", userOne ? userOne.name : 'No');

    if (!userOne) {
        console.log("CRITICAL ERROR: USER ONE not found in DB.");
        process.exit(1);
    }

    const allUsers = await User.find({});
    console.log(`Total users in DB: ${allUsers.length}`);

    const usersToDelete = allUsers.filter(u => 
        u.memberId !== 'EL71432550' && 
        u.role !== 'admin' && 
        u.email !== 'admin@gmail.com'
    );

    console.log(`\n=== USERS TO DELETE (${usersToDelete.length}) ===`);
    usersToDelete.forEach(u => {
        console.log(`- ${u.name} (${u.memberId})`);
    });

    const deletedIds = usersToDelete.map(u => u._id);
    const deletedMemberIds = usersToDelete.map(u => u.memberId);

    // Analyze dependencies
    const queries = {
      cartItems: await Cart.countDocuments({ user: { $in: deletedIds } }),
      deposits: await DepositRequest.countDocuments({ user: { $in: deletedIds } }),
      donationsFrom: await Donation.countDocuments({ fromUser: { $in: deletedIds } }),
      donationsTo: await Donation.countDocuments({ toUser: { $in: deletedIds } }),
      epins: await Epin.countDocuments({ generatedFor: { $in: deletedIds } }), // Needs checking schema
      epinFranchises: await EpinFranchise.countDocuments({ user: { $in: deletedIds } }),
      epinRequests: await EpinRequest.countDocuments({ user: { $in: deletedIds } }),
      epinTransfersFrom: await EpinTransfer.countDocuments({ fromUser: { $in: deletedIds } }),
      epinTransfersTo: await EpinTransfer.countDocuments({ toUser: { $in: deletedIds } }),
      orders: await Order.countDocuments({ user: { $in: deletedIds } }),
      supportTickets: await SupportTicket.countDocuments({ user: { $in: deletedIds } }),
      withdrawals: await WithdrawalRequest.countDocuments({ user: { $in: deletedIds } }),
    };

    console.log("\n=== DEPENDENT RECORDS AFFECTED BY DELETION ===");
    console.log(`Carts: ${queries.cartItems}`);
    console.log(`Deposit Requests: ${queries.deposits}`);
    console.log(`Donations (From): ${queries.donationsFrom}`);
    console.log(`Donations (To): ${queries.donationsTo}`);
    // Epin schema might have different fields, ignoring error if any
    console.log(`Epin Franchises: ${queries.epinFranchises}`);
    console.log(`Epin Requests: ${queries.epinRequests}`);
    console.log(`Epin Transfers (From): ${queries.epinTransfersFrom}`);
    console.log(`Epin Transfers (To): ${queries.epinTransfersTo}`);
    console.log(`Orders: ${queries.orders}`);
    console.log(`Support Tickets: ${queries.supportTickets}`);
    console.log(`Withdrawals: ${queries.withdrawals}`);

  } catch (err) {
    console.error("Analysis Error:", err);
  } finally {
    mongoose.disconnect();
  }
};

runAnalysis();
