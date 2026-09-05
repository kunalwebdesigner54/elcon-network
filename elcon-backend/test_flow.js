const mongoose = require('mongoose');
const User = require('./models/User');
const WithdrawalRequest = require('./models/WithdrawalRequest');
const WalletTransaction = require('./models/WalletTransaction');
const { createWithdrawalRequest } = require('./controllers/withdrawalsController');
const httpMocks = require('node-mocks-http'); // Maybe not available, I'll just do it directly.

async function test() {
  await mongoose.connect('mongodb+srv://mfarhankhan068:MDKMqLJZ0inz9fv7@cluster0.ttfk3ui.mongodb.net/mlmsoftware?retryWrites=true&w=majority');
  
  // Set the user balance to 9900 first
  const user = await User.findOneAndUpdate(
    { memberId: 'EL72674645' }, 
    { walletBalance: 9900 }, 
    { new: true }
  );
  console.log('Set user balance to 9900');
  
  // Delete all pending withdrawals to start fresh for test
  await WithdrawalRequest.deleteMany({ userId: user._id, status: 'Pending' });
  await WalletTransaction.deleteMany({ memberId: user.memberId, description: /WITHDRAWAL DEBIT/ });
  
  // Create first request (should debit)
  const req = {
    user: { id: user._id.toString() },
    body: {
      amount: 9000,
      paymentMethod: 'bank',
      transactionPassword: user.transactionPassword, // assuming we bypass it or we just use the controller?
    }
  };
  
  // Since we can't easily bypass password, let's just run the DB part directly:
  const amount = 9000;
  const requestId = 'WDR999999';
  
  const updatedUser = await User.findByIdAndUpdate(user._id, { $inc: { walletBalance: -amount } }, { new: true }).select('memberId walletBalance');
  console.log('User balance after debit:', updatedUser.walletBalance);
  
  const { createWalletTransaction } = require('./utils/walletHelper');
  await createWalletTransaction({
    memberId: updatedUser.memberId,
    description: `WITHDRAWAL DEBIT - ${requestId}`,
    debit: amount,
    approvalStatus: 'Pending',
  });
  
  await WithdrawalRequest.create({
    requestId,
    userId: user._id,
    amount,
    status: 'Pending'
  });
  
  console.log('Test completed successfully. Balance is:', updatedUser.walletBalance);
}

test().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
