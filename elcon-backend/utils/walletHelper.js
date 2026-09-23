const WalletTransaction = require('../models/WalletTransaction');
const DiscountWalletTransaction = require('../models/DiscountWalletTransaction');
const crypto = require('crypto');

const createWalletTransaction = async ({ memberId, description, credit = 0, debit = 0, approvalStatus = 'Approved' }) => {
  if ((!credit || credit === 0) && (!debit || debit === 0)) return null;
  return WalletTransaction.create({
    transactionId: `WLT${Math.floor(100000 + Math.random() * 900000)}`,
    memberId: String(memberId || '').trim(),
    description: String(description || '').trim(),
    credit: Number(credit || 0),
    debit: Number(debit || 0),
    approvalStatus: String(approvalStatus || 'Approved').trim(),
  });
};

const createDiscountWalletTransaction = async ({ memberId, memberName, transactionType, credit = 0, debit = 0, balance = 0, reference }) => {
  if ((!credit || credit === 0) && (!debit || debit === 0)) return null;
  return DiscountWalletTransaction.create({
    transactionId: `DWT${Math.floor(100000 + Math.random() * 900000)}`,
    memberId: String(memberId || '').trim(),
    memberName: String(memberName || '').trim(),
    transactionType: String(transactionType || '').trim(),
    credit: Number(credit || 0),
    debit: Number(debit || 0),
    balance: Number(balance || 0),
    reference: String(reference || '').trim(),
  });
};

module.exports = { createWalletTransaction, createDiscountWalletTransaction };
