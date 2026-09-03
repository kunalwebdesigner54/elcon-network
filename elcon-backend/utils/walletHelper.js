const WalletTransaction = require('../models/WalletTransaction');
const crypto = require('crypto');

const createWalletTransaction = async ({ memberId, description, credit = 0, debit = 0 }) => {
  if ((!credit || credit === 0) && (!debit || debit === 0)) return null;
  return WalletTransaction.create({
    transactionId: `WLT${Date.now()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    memberId: String(memberId || '').trim(),
    description: String(description || '').trim(),
    credit: Number(credit || 0),
    debit: Number(debit || 0),
  });
};

module.exports = { createWalletTransaction };
