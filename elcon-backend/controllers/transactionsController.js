const Order = require('../models/Order');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const Epin = require('../models/Epin');
const EpinTransfer = require('../models/EpinTransfer');
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

  const orders = await Order.find().populate('userId', 'memberId').sort({ createdAt: -1 });
  orders.forEach((order) => {
    rows.push({
      dateTime: formatDateTime(order.createdAt),
      transactionId: order.orderNo,
      memberId: order.userId?.memberId || String(order.userId),
      description: 'PRODUCT PURCHASE',
      credit: 0,
      debit: Number(order.finalTotal || 0),
      createdAt: order.createdAt,
    });
  });

  const withdrawals = await WithdrawalRequest.find().sort({ createdAt: -1 });
  withdrawals.forEach((withdrawal) => {
    const status = String(withdrawal.status || '').trim().toUpperCase();
    if (!includeAudit && ['REJECTED', 'CANCELLED', 'CANCEL'].includes(status)) {
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

  const transfers = await EpinTransfer.find().sort({ createdAt: -1 });
  transfers.forEach((transfer) => {
    rows.push({
      dateTime: formatDateTime(transfer.createdAt),
      transactionId: transfer.epinNo,
      memberId: transfer.fromMember,
      description: 'EPIN TRANSFER',
      credit: 0,
      debit: Number(transfer.amount || 0),
      createdAt: transfer.createdAt,
    });
  });

  const walletTransactions = await WalletTransaction.find().sort({ createdAt: -1 });
  walletTransactions.forEach((transaction) => {
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

  const levelIncomes = await LevelIncome.find().sort({ createdAt: -1 });
  const repurchaseIncomes = await RepurchaseIncome.find().sort({ createdAt: -1 });

  const incomeMap = new Map();

  const addIncomeRow = (record, type) => {
    const memberId = record.recipientMemberId || record.purchasingMemberId;
    if (!memberId) return;
    const dateKey = new Date(record.createdAt).toISOString().split('T')[0];
    const key = `${memberId}__${dateKey}`;
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
    const tdsDeduction = Number(value.amount) * tdsRate;
    const netAmount = Number(value.amount) - tdsDeduction;
    rows.push({
      dateTime: formatDateTime(value.createdAt),
      transactionId: `DAILY-${value.memberId}-${value.description.replace(' ', '-')}`,
      memberId: value.memberId,
      description: `${value.description} (TDS ${(tdsRate * 100).toFixed(0)}%)`,
      credit: Number(netAmount.toFixed(2)),
      debit: 0,
      createdAt: value.createdAt,
    });
  });

  rows.sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));

  const uniqueMemberIds = [...new Set(rows.map((row) => row.memberId).filter(Boolean))];
  const users = await User.find({ memberId: { $in: uniqueMemberIds } }).select('memberId name').lean();
  const memberNameMap = new Map(users.map((user) => [String(user.memberId).trim(), user.name || '']));

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
    let runningBalance = 0;
    const mappedRows = rows.map((row, index) => {
      runningBalance += Number(row.credit || 0) - Number(row.debit || 0);
      return {
        sNo: index + 1,
        dateTime: row.dateTime,
        transactionId: row.transactionId,
        memberId: row.memberId,
        memberName: row.memberName || '',
        description: row.description,
        credit: Number(row.credit || 0),
        debit: Number(row.debit || 0),
        balance: runningBalance,
      };
    });

    res.json({ success: true, transactions: mappedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};