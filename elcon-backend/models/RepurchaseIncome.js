const mongoose = require('mongoose');

const repurchaseIncomeSchema = new mongoose.Schema(
  {
    recipientMemberId: {
      type: String,
      required: true,
      index: true,
    },
    purchasingMemberId: {
      type: String,
      required: true,
      index: true,
    },
    purchasingMemberName: {
      type: String,
      default: '---',
    },
    level: {
      type: Number,
      required: true,
    },
    physicalDepth: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number,
      required: true,
    },
    orderNo: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['CREDITED'],
      default: 'CREDITED',
    },
    // Detailed audit trail of skipped members during traversal
    skippedMembers: [{ type: mongoose.Schema.Types.Mixed }],
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate income for the same order + level
repurchaseIncomeSchema.index({ orderNo: 1, level: 1 }, { unique: true });

module.exports = mongoose.model('RepurchaseIncome', repurchaseIncomeSchema);
