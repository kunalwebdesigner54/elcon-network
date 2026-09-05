const mongoose = require('mongoose');
const User = require('./models/User');
const WithdrawalRequest = require('./models/WithdrawalRequest');
const WalletTransaction = require('./models/WalletTransaction');

async function test() {
  await mongoose.connect('mongodb+srv://mfarhankhan068:MDKMqLJZ0inz9fv7@cluster0.ttfk3ui.mongodb.net/mlmsoftware?retryWrites=true&w=majority');
  
  const user = await User.findOne({ memberId: 'EL72674645' });
  if (!user) {
    console.log('User not found');
    process.exit(0);
  }
  
  console.log('User Wallet:', user.walletBalance);
  
  const reqs = await WithdrawalRequest.find({ userId: user._id }).lean();
  console.log('Withdrawals:', reqs.length);
  reqs.forEach(r => {
    console.log(`Amount: ${r.amount}, Status: ${r.status}, Net: ${r.netAmount}, RequestId: ${r.requestId}, Date: ${r.createdAt}`);
  });
  
  const txs = await WalletTransaction.find({ memberId: user.memberId, description: /WITHDRAWAL/ }).lean();
  console.log('Wallet Txs:', txs.length);
  txs.forEach(t => {
    console.log(t.description, 'Debit:', t.debit, 'Credit:', t.credit, 'Status:', t.approvalStatus);
  });
}

test().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
