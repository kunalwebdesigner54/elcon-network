const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const WithdrawalRequest = require('./models/WithdrawalRequest');
const Epin = require('./models/Epin');
const WalletTransaction = require('./models/WalletTransaction');
const LevelIncome = require('./models/LevelIncome');
const RepurchaseIncome = require('./models/RepurchaseIncome');
const SiteSetting = require('./models/SiteSetting');

async function verify() {
  await mongoose.connect('mongodb+srv://mfarhankhan068:MDKMqLJZ0inz9fv7@cluster0.ttfk3ui.mongodb.net/mlmsoftware?retryWrites=true&w=majority');
  console.log('Connected to DB');

  // 1. Calculate All Members List Total Wallet Balance
  const walletAggregation = await User.aggregate([
    { $match: {} }, // Match all users, including admin
    { $group: { _id: null, totalWallet: { $sum: { $ifNull: ['$walletBalance', 0] } } } }
  ]);
  const totalWalletBalance = Number(walletAggregation[0]?.totalWallet || 0);
  console.log('All Members List Total Wallet Balance (including Admin):', totalWalletBalance.toFixed(2));

  // Verify Admin
  const admin = await User.findOne({ role: 'admin' }).lean();
  console.log('Admin appears exactly once?', !!admin, 'ID:', admin?.memberId, 'Wallet:', admin?.walletBalance);

  // 2. Calculate Transaction History Credit/Debit Balance
  let totalCredit = 0;
  let totalDebit = 0;

  // PRODUCT PURCHASE
  const orders = await Order.find({ 
    $or: [
      { paymentApprovalStatus: 'Approved' },
      { paymentStatus: 'Paid', paymentApprovalStatus: { $exists: false } }
    ]
  }).lean();
  orders.forEach((order) => {
    totalDebit += Number(order.finalTotal || 0);
  });

  // WITHDRAWAL
  const withdrawals = await WithdrawalRequest.find({ status: { $in: ['Approve', 'Succeed'] } }).lean();
  withdrawals.forEach((withdrawal) => {
    const status = String(withdrawal.status || '').trim().toUpperCase();
    if (!['REJECTED', 'CANCELLED', 'CANCEL'].includes(status)) {
      totalDebit += Number(withdrawal.amount || 0);
    }
  });

  // EPIN GENERATION
  const epins = await Epin.find().lean();
  epins.forEach((epin) => {
    totalDebit += Number(epin.cost || 0);
  });

  // Wallet Transactions (generic)
  const walletTransactions = await WalletTransaction.find({ approvalStatus: 'Approved' }).lean();
  walletTransactions.forEach((transaction) => {
    const desc = String(transaction.description || '');
    if (
      /^LEVEL INCOME(?: CREDIT)? - Level \d+$/.test(desc) ||
      /^REPURCHASE INCOME(?: CREDIT)? - Level \d+$/.test(desc) ||
      /^TDS DEDUCTION \(Level \d+\)$/.test(desc) ||
      /^ADMIN CHARGE \(Level \d+\)$/.test(desc) ||
      /^PRODUCT PURCHASE(?: REVERSED)? - /.test(desc) ||
      /^WITHDRAWAL (DEBIT|REVERSED) - /.test(desc) ||
      /^EPIN GENERATION - /.test(desc)
    ) {
      return;
    }
    totalCredit += Number(transaction.credit || 0);
    totalDebit += Number(transaction.debit || 0);
  });

  // LEVEL & REPURCHASE INCOMES
  const tdsSetting = await SiteSetting.findOne({ settingKey: 'plan-setting' }).lean();
  const tdsRate = Number((tdsSetting?.data?.tdsCharge || '5 %').replace('%', '').trim()) / 100 || 0.05;
  const adminChargeRate = Number((tdsSetting?.data?.adminCharges || '5 %').replace('%', '').trim()) / 100 || 0.05;

  const levelIncomes = await LevelIncome.find().lean();
  const repurchaseIncomes = await RepurchaseIncome.find().lean();

  const incomeMap = new Map();
  const addIncomeRow = (record, type) => {
    const memberId = record.recipientMemberId || record.purchasingMemberId;
    if (!memberId) return;
    const dateKey = new Date(record.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const key = `${memberId}__${dateKey}__${type}`;
    const current = incomeMap.get(key) || {
      amount: 0,
    };
    current.amount += Number(record.amount || 0);
    incomeMap.set(key, current);
  };

  levelIncomes.forEach((record) => addIncomeRow(record, 'LEVEL INCOME'));
  repurchaseIncomes.forEach((record) => addIncomeRow(record, 'REPURCHASE INCOME'));

  incomeMap.forEach((value) => {
    const grossAmount = Number(value.amount);
    const tdsDeduction = Number((grossAmount * tdsRate).toFixed(2));
    const adminChargeDeduction = Number((grossAmount * adminChargeRate).toFixed(2));
    const netAmount = Number((grossAmount - tdsDeduction - adminChargeDeduction).toFixed(2));

    if (netAmount > 0) {
      totalCredit += netAmount;
    }
  });

  const transactionHistoryBalance = totalCredit - totalDebit;
  console.log('Transaction History Credit:', totalCredit.toFixed(2), 'Debit:', totalDebit.toFixed(2));
  console.log('Transaction History Balance:', transactionHistoryBalance.toFixed(2));
  console.log('Difference:', (totalWalletBalance - transactionHistoryBalance).toFixed(2));
}

verify().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
