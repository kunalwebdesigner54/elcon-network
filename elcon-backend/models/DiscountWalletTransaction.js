const mongoose = require('mongoose');

const discountWalletTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    memberId: {
      type: String,
      required: true,
      index: true,
    },
    memberName: {
      type: String,
    },
    transactionType: {
      type: String,
      required: true, // e.g. ADMIN CREDIT, ADMIN DEBIT, REWARD CREDIT, DISCOUNT USED
    },
    credit: {
      type: Number,
      default: 0,
    },
    debit: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    reference: {
      type: String, // e.g. Order No, Admin Ref
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DiscountWalletTransaction', discountWalletTransactionSchema);
