const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    couponId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    memberId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    memberName: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'USED', 'EXPIRED'],
      default: 'ACTIVE',
      index: true,
    },
    usedInOrder: {
      type: String,
      trim: true,
      default: '',
    },
    usedDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    sourceOrderNo: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);