const Order = require('../models/Order');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const Epin = require('../models/Epin');
const WalletTransaction = require('../models/WalletTransaction');
const User = require('../models/User');
const LevelIncome = require('../models/LevelIncome');
const RepurchaseIncome = require('../models/RepurchaseIncome');
const SiteSetting = require('../models/SiteSetting');

const formatDateTime = (value) => new Date(value).toLocaleString('en-IN', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
});

const buildTransactionRows = async (scope, memberIdentifiers = [], includeAudit = false) => {
  const rows = [];

  const orders = await Order.find().sort({ createdAt: -1 });
  const userIds = [...new Set(orders.map((order) => String(order.userId || '')).filter(Boolean))];
  const users = await User.find({ _id: { $in: userIds } }).select('_id memberId').lean();
  const userMap = new Map(users.map((user) => [String(user._id), user.memberId || '']));

  orders.forEach((order) => {
    rows.push({
      dateTime: formatDateTime(order.createdAt),
      transactionId: order.orderNo,
      memberId: userMap.get(String(order.userId)) || String(order.userId),
      description: 'PRODUCT PURCHASE',
      credit: 0,
      debit: Number(order.finalTotal || 0),
      createdAt: order.createdAt,
    });
  });

  const withdrawals = await WithdrawalRequest.find().sort({ createdAt: -1 });
  withdrawals.forEach((withdrawal) => {
    const status = String(withdrawal.status || '').trim().toUpperCase();
    if (['REJECTED', 'CANCELLED', 'CANCEL'].includes(status)) {
      return;
    }
    rows.push({
      dateTime: formatDateTime(withdrawal.createdAt),
      transactionId: withdrawal.requestId,
      memberId: withdrawal.memberId,
      description: `WITHDRAWAL ${withdrawal.status}`,
      credit: 0,
      debit: Number(withdrawal.amount || 0),
      createdAt: withdrawal.createdAt,
    });
  });

  const epins = await Epin.find().sort({ createdAt: -1 });
  epins.forEach((epin) => {
    rows.push({
      dateTime: formatDateTime(epin.createdAt),
      transactionId: epin.epinNo,
      memberId: epin.generatedBy,
      description: 'EPIN GENERATION',
      credit: 0,
      debit: Number(epin.cost || 0),
      createdAt: epin.createdAt,
    });
  });

  const walletTransactions = await WalletTransaction.find().sort({ createdAt: -1 });
  walletTransactions.forEach((transaction) => {
    const desc = String(transaction.description || '');
    if (
      /^LEVEL INCOME(?: CREDIT)? - Level \d+$/.test(desc) ||
      /^REPURCHASE INCOME(?: CREDIT)? - Level \d+$/.test(desc) ||
      /^TDS DEDUCTION \(Level \d+\)$/.test(desc) ||
      /^ADMIN CHARGE \(Level \d+\)$/.test(desc)
    ) {
      return;
    }
    rows.push({
      dateTime: formatDateTime(transaction.createdAt),
      transactionId: transaction.transactionId,
      memberId: transaction.memberId,
      description: transaction.description,
      credit: Number(transaction.credit || 0),
      debit: Number(transaction.debit || 0),
      createdAt: transaction.createdAt,
    });
  });

  const tdsSetting = await SiteSetting.findOne({ settingKey: 'plan-setting' }).lean();
  const tdsRate = Number((tdsSetting?.data?.tdsCharge || '5 %').replace('%', '').trim()) / 100 || 0.05;
  const adminChargeRate = Number((tdsSetting?.data?.adminCharges || '5 %').replace('%', '').trim()) / 100 || 0.05;

  const levelIncomes = await LevelIncome.find().sort({ createdAt: -1 });
  const repurchaseIncomes = await RepurchaseIncome.find().sort({ createdAt: -1 });

  const incomeMap = new Map();

  const addIncomeRow = (record, type) => {
    const memberId = record.recipientMemberId || record.purchasingMemberId;
    if (!memberId) return;
    const dateKey = new Date(record.createdAt).toISOString().split('T')[0];
    const key = `${memberId}__${dateKey}__${type}`;
    const current = incomeMap.get(key) || {
      memberId,
      date: new Date(dateKey),
      amount: 0,
      description: type,
      createdAt: record.createdAt,
    };
    current.amount += Number(record.amount || 0);
    if (record.createdAt > current.createdAt) {
      current.createdAt = record.createdAt;
    }
    incomeMap.set(key, current);
  };

  levelIncomes.forEach((record) => addIncomeRow(record, 'LEVEL INCOME'));
  repurchaseIncomes.forEach((record) => addIncomeRow(record, 'REPURCHASE INCOME'));

  incomeMap.forEach((value) => {
    const grossAmount = Number(value.amount);
    const tdsDeduction = Number((grossAmount * tdsRate).toFixed(2));
    const adminChargeDeduction = Number((grossAmount * adminChargeRate).toFixed(2));
    const netAmount = Number((grossAmount - tdsDeduction - adminChargeDeduction).toFixed(2));
    const incomeLabel = value.description.replace(' ', '-');

    if (netAmount > 0) {
      rows.push({
        dateTime: formatDateTime(value.createdAt),
        transactionId: `DAILY-${value.memberId}-${incomeLabel}`,
        memberId: value.memberId,
        description: `${value.description} (TDS ${(tdsRate * 100).toFixed(0)}% + Admin ${(adminChargeRate * 100).toFixed(0)}%)`,
        credit: netAmount,
        debit: 0,
        createdAt: value.createdAt,
      });
    }
  });

  rows.sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));

  const uniqueMemberIds = [...new Set(rows.map((row) => row.memberId).filter(Boolean))];
  const incomeUsers = await User.find({ memberId: { $in: uniqueMemberIds } }).select('memberId name').lean();
  const memberNameMap = new Map(incomeUsers.map((user) => [String(user.memberId).trim(), user.name || '']));

  rows.forEach((row) => {
    row.memberName = memberNameMap.get(String(row.memberId).trim()) || '';
  });

  if (scope === 'user' && memberIdentifiers.length) {
    return rows.filter((row) => memberIdentifiers.includes(row.memberId) || memberIdentifiers.includes(row.transactionId));
  }

  return rows;
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const requestedScope = String(req.query.scope || 'admin').toLowerCase();
    const includeAudit = String(req.query.audit || 'false').toLowerCase() === 'true';
    const scope = req.user?.role === 'admin' ? requestedScope : 'user';
    const memberIdentifiers = [req.query.memberId, req.user?.memberId, req.user?.epin, req.user?.id]
      .map((value) => String(value || '').trim())
      .filter(Boolean);
    
    const rows = await buildTransactionRows(scope, memberIdentifiers, includeAudit);
    
    // Sort ASCENDING so we can calculate proper running balances
    rows.sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt));
    
    const uniqueMemberIds = [...new Set(rows.map((row) => row.memberId).filter(Boolean))];
    const users = await User.find({ memberId: { $in: uniqueMemberIds } }).select('memberId name walletBalance').lean();
    const userMap = new Map(users.map((u) => [String(u.memberId).trim(), { name: u.name, walletBalance: Number(u.walletBalance || 0) }]));
    
    const userSums = new Map();
    rows.forEach(row => {
      const currentSum = userSums.get(row.memberId) || 0;
      userSums.set(row.memberId, currentSum + Number(row.credit || 0) - Number(row.debit || 0));
    });
    
    let allRows = [];
    userMap.forEach((userData, memberId) => {
      const sum = userSums.get(memberId) || 0;
      const diff = userData.walletBalance - sum;
      if (Math.abs(diff) > 0.01) {
        allRows.push({
          dateTime: 'INITIAL',
          transactionId: 'OPENING-BAL',
          memberId: memberId,
          memberName: userData.name || '',
          description: 'Opening Balance',
          credit: diff > 0 ? diff : 0,
          debit: diff < 0 ? Math.abs(diff) : 0,
          createdAt: new Date(0), // Oldest possible date
        });
      }
    });
    
    allRows = [...allRows, ...rows];
    allRows.sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt));
    
    const userBalances = new Map();
    const mappedRows = allRows.map((row) => {
      const memberId = row.memberId;
      let runningBalance = userBalances.get(memberId) || 0;
      runningBalance += Number(row.credit || 0) - Number(row.debit || 0);
      userBalances.set(memberId, runningBalance);
      
      return {
        transactionId: row.transactionId,
        dateTime: row.dateTime,
        memberId: row.memberId,
        memberName: row.memberName || userMap.get(memberId)?.name || '',
        description: row.description,
        credit: Number(row.credit || 0),
        debit: Number(row.debit || 0),
        balance: runningBalance,
        createdAt: row.createdAt,
      };
    });
    
    // Sort DESCENDING for display
    mappedRows.sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
    
    mappedRows.forEach((row, index) => {
      row.sNo = index + 1;
    });

    res.json({ success: true, transactions: mappedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};