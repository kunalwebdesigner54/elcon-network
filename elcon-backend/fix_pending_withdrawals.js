const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://mfarhankhan068:MDKMqLJZ0inz9fv7@cluster0.ttfk3ui.mongodb.net/mlmsoftware?retryWrites=true&w=majority').then(async () => {
  const User = require('./models/User');
  const WithdrawalRequest = require('./models/WithdrawalRequest');
  const WalletTransaction = require('./models/WalletTransaction');
  const { createWalletTransaction } = require('./utils/walletHelper');

  const pendingRequests = await WithdrawalRequest.find({ status: 'Pending' });
  console.log(`Found ${pendingRequests.length} pending withdrawal requests.`);

  for (const request of pendingRequests) {
    const user = await User.findById(request.userId);
    if (!user) continue;

    const requestAmount = Number(request.amount || request.netAmount || 0);

    const existingDebit = await WalletTransaction.findOne({
      memberId: user.memberId,
      description: `WITHDRAWAL DEBIT - ${request.requestId}`
    });

    if (!existingDebit) {
      console.log(`Fixing wallet for ${user.memberId}, deducting ${requestAmount}`);
      const updatedUser = await User.findByIdAndUpdate(request.userId, { $inc: { walletBalance: -requestAmount } }, { new: true });
      if (updatedUser) {
        await createWalletTransaction({
          memberId: updatedUser.memberId,
          description: `WITHDRAWAL DEBIT - ${request.requestId}`,
          debit: requestAmount,
          approvalStatus: 'Pending',
        });
      }
    } else {
      console.log(`Wallet already deducted for ${request.requestId}`);
    }
  }

  console.log('Fix complete.');
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
