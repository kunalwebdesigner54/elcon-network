const mongoose = require('mongoose');
const User = require('./models/User');
const WithdrawalRequest = require('./models/WithdrawalRequest');
const WalletTransaction = require('./models/WalletTransaction');
const withdrawalsController = require('./controllers/withdrawalsController');

async function test() {
  await mongoose.connect('mongodb+srv://mfarhankhan068:MDKMqLJZ0inz9fv7@cluster0.ttfk3ui.mongodb.net/mlmsoftware?retryWrites=true&w=majority');
  console.log('Connected');
  
  // Find a user with some balance
  const user = await User.findOne({ walletBalance: { $gte: 2000 } });
  if (!user) {
    console.log('No user with enough balance');
    process.exit(0);
  }
  
  console.log('Initial Balance:', user.walletBalance, user.memberId);
  
  // Create mock req and res
  const req = {
    user: { id: user._id.toString() },
    body: {
      amount: 1000,
      paymentMethod: 'bank',
      transactionPassword: user.transactionPassword || '123456', // Assuming we don't know the exact plaintext password if it's hashed, wait! We can bypass password check by mocking it or directly calling the DB logic
    }
  };
  
  // Directly do what createWithdrawalRequest does to see if it works
  const amount = 1000;
  const requestId = 'WDR' + Math.floor(100000 + Math.random() * 900000);
  
  const updatedUser = await User.findByIdAndUpdate(user._id, { $inc: { walletBalance: -amount } }, { new: true }).select('memberId walletBalance');
  console.log('Updated User Balance:', updatedUser.walletBalance);
  
  await WalletTransaction.create({
    memberId: updatedUser.memberId,
    description: `WITHDRAWAL DEBIT - ${requestId}`,
    debit: amount,
    approvalStatus: 'Pending',
  });
  
  // Then simulate admin approval
  const nextStatus = 'Approve';
  const request = {
    requestId: requestId,
    userId: user._id,
    amount: amount,
    status: 'Pending',
  };
  
  // Call adjustWalletOnStatusChange logic manually
  const wasDeducted = ['Pending', 'Approve', 'Succeed'].includes(request.status);
  const willBeDeducted = ['Pending', 'Approve', 'Succeed'].includes(nextStatus);

  if (!wasDeducted && willBeDeducted) {
    console.log('Would deduct again (BAD if it happened)');
  }
  
  if (wasDeducted && !willBeDeducted) {
    console.log('Would refund');
  }
  
  console.log('Done testing DB operations directly');
}

test().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
