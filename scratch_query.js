const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elcon')
  .then(async () => {
    const User = require('./models/User');
    const WalletTransaction = require('./models/WalletTransaction');
    
    const user = await User.findOne({ memberId: 'EL91423356' });
    if (!user) {
      console.log('User not found');
      process.exit(0);
    }
    
    console.log('User:', user.name, 'Role:', user.role, 'WalletBalance:', user.walletBalance);
    
    const txs = await WalletTransaction.find({ memberId: 'EL91423356' }).sort({createdAt: -1}).limit(20);
    console.log('\nRecent Wallet Transactions:');
    txs.forEach(t => console.log(t.createdAt.toISOString() + ' | Credit: ' + t.credit + ' | Debit: ' + t.debit + ' | Desc: ' + t.description));
    
    // Also summarize total credit
    const allTxs = await WalletTransaction.find({ memberId: 'EL91423356' });
    let totalDonationCredit = 0;
    let totalDepositCredit = 0;
    let otherCredit = 0;
    
    allTxs.forEach(t => {
      const desc = t.description ? t.description.toLowerCase() : '';
      if (desc.includes('donation')) {
        totalDonationCredit += Number(t.credit || 0);
      } else if (desc.includes('deposit')) {
        totalDepositCredit += Number(t.credit || 0);
      } else {
        otherCredit += Number(t.credit || 0);
      }
    });
    console.log('\nTotal Credit from Donation:', totalDonationCredit);
    console.log('Total Credit from Deposit:', totalDepositCredit);
    console.log('Total Credit from Other:', otherCredit);
    
    process.exit(0);
  });
