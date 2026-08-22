const mongoose = require('mongoose');

const levelIncomeSchema = new mongoose.Schema(
  {
    recipientMemberId: {
      type: String,
      required: true,
      index: true,
    },
    joiningMemberId: {
      type: String,
      required: true,
    },
    joiningMemberName: {
      type: String,
      default: '---',
    },
    level: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 20,
    },
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },
    status: {
      type: String,
      enum: ['CREDITED'],
      default: 'CREDITED',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to strictly prevent duplicate income for the same joining event + level + recipient
levelIncomeSchema.index({ joiningMemberId: 1, level: 1, recipientMemberId: 1 }, { unique: true });

module.exports = mongoose.model('LevelIncome', levelIncomeSchema);
