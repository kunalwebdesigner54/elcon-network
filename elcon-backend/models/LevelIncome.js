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
    physicalDepth: {
      type: Number,
      default: 0,
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
    // Detailed audit trail of skipped members during traversal
    skippedMembers: [{ type: mongoose.Schema.Types.Mixed }],
  },
  {
    timestamps: true,
  }
);

// Compound unique index to strictly prevent duplicate income for the same joining event + level
levelIncomeSchema.index({ joiningMemberId: 1, level: 1 }, { unique: true });

module.exports = mongoose.model('LevelIncome', levelIncomeSchema);
