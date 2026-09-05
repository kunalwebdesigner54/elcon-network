const mongoose = require('mongoose');
const User = require('./models/User');
const WalletTransaction = require('./models/WalletTransaction');

async function verify() {
  await mongoose.connect('mongodb+srv://mfarhankhan068:MDKMqLJZ0inz9fv7@cluster0.ttfk3ui.mongodb.net/mlmsoftware?retryWrites=true&w=majority');
  console.log('Connected to DB');

  // 1. Calculate All Members List Total Wallet Balance
  const walletAggregation = await User.aggregate([
    { $match: {} }, // Match all users, including admin
    { $group: { _id: null, totalWallet: { $sum: { $ifNull: ['$walletBalance', 0] } } } }
  ]);
  const totalWalletBalance = Number(walletAggregation[0]?.totalWallet || 0);
  console.log('All Members List Total Wallet Balance:', totalWalletBalance.toFixed(2));

  // 2. Sum of ALL Wallet Transactions
  const wTxAggregation = await WalletTransaction.aggregate([
    { $match: { approvalStatus: 'Approved' } },
    { $group: { _id: null, totalCredit: { $sum: { $ifNull: ['$credit', 0] } }, totalDebit: { $sum: { $ifNull: ['$debit', 0] } } } }
  ]);
  const sumTxCredit = Number(wTxAggregation[0]?.totalCredit || 0);
  const sumTxDebit = Number(wTxAggregation[0]?.totalDebit || 0);
  console.log('WalletTx Total Credit:', sumTxCredit.toFixed(2));
  console.log('WalletTx Total Debit:', sumTxDebit.toFixed(2));
  console.log('WalletTx Net Balance:', (sumTxCredit - sumTxDebit).toFixed(2));

  // 3. Compare
  console.log('Difference (TotalWallet - NetWalletTx):', (totalWalletBalance - (sumTxCredit - sumTxDebit)).toFixed(2));
}

verify().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
