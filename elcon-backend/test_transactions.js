require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const WalletTransaction = require('./models/WalletTransaction');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const wlt = await WalletTransaction.find({ 
    $or: [
      { description: /EPIN/i },
      { transactionId: /EPR/i }
    ]
  }).sort({ createdAt: -1 }).limit(10).lean();
  
  console.log('Recent EPIN related WalletTransactions:', JSON.stringify(wlt, null, 2));
  
  process.exit(0);
}

run();
