const mongoose = require('mongoose');
const WalletTransaction = require('./models/WalletTransaction');

async function verify() {
  await mongoose.connect('mongodb+srv://mfarhankhan068:MDKMqLJZ0inz9fv7@cluster0.ttfk3ui.mongodb.net/mlmsoftware?retryWrites=true&w=majority');
  
  const allTx = await WalletTransaction.find({}).lean();
  console.log(`Found ${allTx.length} WalletTransactions`);
  
  if (allTx.length > 0) {
    console.log('Sample:', allTx[0]);
  }
}

verify().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
