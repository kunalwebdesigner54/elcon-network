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

const buildTransactionRows = async (scope, memberIdentifiers = [], includeAudit = false, options = {}) => {
  const { startDate, endDate, skip = 0, limit = 50 } = options;
  const rows = [];

  const buildDateFilter = (field = 'createdAt') => {
    const filter = {};
    if (startDate) filter[field] = { ...filter[field], $gte: startDate };
    if (endDate) filter[field] = { ...filter[field], $lte: endDate };
    return Object.keys(filter).length ? filter : {};
  };

  const dateFilter = buildDateFilter();

  const orders = await Order.find({ 
    $or: [
      { paymentApprovalStatus: 'Approved' },
      { paymentStatus: 'Paid', paymentApprovalStatus: { $exists: false } }
    ],
    ...dateFilter
  }).sort({ createdAt: -1 }).skip(skip).limit(limit);
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

  const withdrawals = await WithdrawalRequest.find({ 
    status: { $in: ['Pending', 'Approve', 'Succeed'] },
    ...dateFilter
  }).sort({ createdAt: -1 }).skip(skip).limit(limit);
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

  const walletTransactions = await WalletTransaction.find({ 
    approvalStatus: 'Approved',
    ...dateFilter
  }).sort({ createdAt: -1 }).skip(skip).limit(limit);
  walletTransactions.forEach((transaction) => {
    const desc = String(transaction.description || '');
    if (
      !includeAudit && (
        /^LEVEL INCOME(?: CREDIT)? - Level \d+$/.test(desc) ||
        /^REPURCHASE INCOME(?: CREDIT)? - Level \d+$/.test(desc) ||
        /^TDS DEDUCTION \(Level \d+\)$/.test(desc) ||
        /^ADMIN CHARGE \(Level \d+\)$/.test(desc) ||
        /^PRODUCT PURCHASE(?: REVERSED)? - /.test(desc) ||
        /^WITHDRAWAL (DEBIT|REVERSED) - /.test(desc) ||
        /^DONATION (DEBIT|CREDIT) - /.test(desc)
      )
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

  const levelIncomes = await LevelIncome.find(dateFilter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const repurchaseIncomes = await RepurchaseIncome.find(dateFilter).sort({ createdAt: -1 }).skip(skip).limit(limit);

  const incomeMap = new Map();

  const addIncomeRow = (record, type) => {
    const memberId = record.recipientMemberId || record.purchasingMemberId;
    if (!memberId) return;
    const dateKey = new Date(record.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const key = `${memberId}__${dateKey}__${type}`;
    const current = incomeMap.get(key) || {
      memberId,
      date: new Date(dateKey),
      amount: 0,
      description: (type === 'LEVEL INCOME' || type === 'REPURCHASE INCOME') ? 'Daily_Income' : type,
      createdAt: record.createdAt,
    };
    current.amount += Number(record.amount || 0);
    if (record.createdAt < current.createdAt) {
      current.createdAt = record.createdAt;
    }
    incomeMap.set(key, current);
  };

  levelIncomes.forEach((record) => addIncomeRow(record, 'LEVEL INCOME'));
  repurchaseIncomes.forEach((record) => addIncomeRow(record, 'REPURCHASE INCOME'));

  const incomeRecords = Array.from(incomeMap.values());
  incomeRecords.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const dateCounters = new Map();

  incomeRecords.forEach((value) => {
    const grossAmount = Number(value.amount);
    const tdsDeduction = Number((grossAmount * tdsRate).toFixed(2));
    const adminChargeDeduction = Number((grossAmount * adminChargeRate).toFixed(2));
    const netAmount = Number((grossAmount - tdsDeduction - adminChargeDeduction).toFixed(2));

    if (netAmount > 0) {
      let transactionId = '';
      let description = '';

      if (value.description === 'Daily_Income') {
        const dateObj = new Date(value.createdAt);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const dateStr = `${day}${month}${year}`;

        const count = (dateCounters.get(dateStr) || 0) + 1;
        dateCounters.set(dateStr, count);
        const seq = String(count).padStart(4, '0');
        
        transactionId = `DINC-${dateStr}-${seq}`;
        description = 'Daily_Income';
      } else {
        const incomeLabel = value.description.replace(' ', '-');
        transactionId = `DAILY-${value.memberId}-${incomeLabel}`;
        description = `${value.description} (TDS ${(tdsRate * 100).toFixed(0)}% + Admin ${(adminChargeRate * 100).toFixed(0)}%)`;
      }

      rows.push({
        dateTime: formatDateTime(value.createdAt),
        transactionId,
        memberId: value.memberId,
        description,
        credit: netAmount,
        debit: 0,
        createdAt: value.createdAt,
      });
    }
  });

  // For total count, we need to count without pagination (but with date filter)
  // This is an approximation - in production you'd want separate count queries
  const totalRowsEstimate = rows.length;

  rows.sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));

  const uniqueMemberIds = [...new Set(rows.map((row) => row.memberId).filter(Boolean))];
  const incomeUsers = await User.find({ memberId: { $in: uniqueMemberIds } }).select('memberId name').lean();
  const memberNameMap = new Map(incomeUsers.map((user) => [String(user.memberId).trim(), user.name || '']));

  rows.forEach((row) => {
    row.memberName = memberNameMap.get(String(row.memberId).trim()) || '';
  });

  if (scope === 'user' && memberIdentifiers.length) {
    return { rows: rows.filter((row) => memberIdentifiers.includes(row.memberId) || memberIdentifiers.includes(row.transactionId)), total: totalRowsEstimate };
  }

  return { rows, total: totalRowsEstimate };
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const requestedScope = String(req.query.scope || 'admin').toLowerCase();
    const includeAudit = String(req.query.audit || 'false').toLowerCase() === 'true';
    const scope = req.user?.role === 'admin' ? requestedScope : 'user';
    const memberIdentifiers = [req.query.memberId, req.user?.memberId, req.user?.epin, req.user?.id]
      .map((value) => String(value || '').trim())
      .filter(Boolean);
    
    // Pagination params
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;
    
    // Date range params (optional)
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    if (endDate) endDate.setHours(23, 59, 59, 999);
    
    const { rows, total } = await buildTransactionRows(scope, memberIdentifiers, includeAudit, { startDate, endDate, skip, limit });
    
    rows.sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt));
    
    const uniqueMemberIds = [...new Set(rows.map((row) => row.memberId).filter(Boolean))];
    const users = await User.find({ memberId: { $in: uniqueMemberIds } }).select('memberId name').lean();
    const userMap = new Map(users.map((u) => [String(u.memberId).trim(), u.name || '']));
    
    const userBalances = new Map();
    const mappedRows = rows.map((row) => {
      const memberId = row.memberId;
      let runningBalance = userBalances.get(memberId) || 0;
      runningBalance += Number(row.credit || 0) - Number(row.debit || 0);
      userBalances.set(memberId, runningBalance);
      
      return {
        transactionId: row.transactionId,
        dateTime: row.dateTime,
        memberId: row.memberId,
        memberName: row.memberName || userMap.get(memberId) || '',
        description: row.description,
        credit: Number(row.credit || 0),
        debit: Number(row.debit || 0),
        balance: runningBalance,
        createdAt: row.createdAt,
      };
    });
    
    mappedRows.sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
    
    mappedRows.forEach((row, index) => {
      row.sNo = index + 1;
    });

    let walletBalance = 0;
    if (scope === 'user' && req.user?.memberId) {
      const dbUser = await User.findOne({ memberId: req.user.memberId });
      if (dbUser) {
        walletBalance = dbUser.walletBalance || 0;
      }
    }

    res.json({ success: true, transactions: mappedRows, total, page, limit, totalPages: Math.ceil(total / limit), walletBalance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const DiscountWalletTransaction = require('../models/DiscountWalletTransaction');

exports.getDiscountWalletTransactions = async (req, res) => {
  try {
    const memberId = req.user?.memberId;
    if (!memberId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { page = 1, limit = 10, transactionType, reference, fromDate, toDate } = req.query;
    
    // Build query
    const query = { memberId };
    if (transactionType) query.transactionType = transactionType;
    if (reference) query.reference = { $regex: reference, $options: 'i' };
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const total = await DiscountWalletTransaction.countDocuments(query);
    const skip = (Number(page) - 1) * Number(limit);
    
    const rawTransactions = await DiscountWalletTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Map serial numbers and format date
    const transactions = rawTransactions.map((tx, index) => ({
      ...tx,
      sno: skip + index + 1,
      transactionDate: new Date(tx.createdAt).toLocaleString('en-GB')
    }));

    // Calculate totals for the user
    const allUserTx = await DiscountWalletTransaction.find({ memberId }).lean();
    let totalIssued = 0;
    let totalUsed = 0;
    allUserTx.forEach(tx => {
      totalIssued += Number(tx.credit || 0);
      totalUsed += Number(tx.debit || 0);
    });

    // Get user coupon balance
    const User = require('../models/User');
    const user = await User.findOne({ memberId }).select('couponWalletBalance discountCouponBalance');
    const walletBalance = user ? ((user.couponWalletBalance || 0) + (user.discountCouponBalance || 0)) : 0;

    res.json({ 
      success: true, 
      transactions, 
      total, 
      totalPages: Math.ceil(total / Number(limit)),
      walletBalance,
      totalIssued,
      totalUsed
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

