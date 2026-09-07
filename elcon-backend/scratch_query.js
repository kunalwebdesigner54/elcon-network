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
    
    const allTxs = await WalletTransaction.find({ memberId: 'EL91423356' });
    let totalCredit = 0;
    
    allTxs.forEach(t => {
      totalCredit += Number(t.credit || 0);
    });
    console.log('\nTotal Credit:', totalCredit);
    
    process.exit(0);
  });
