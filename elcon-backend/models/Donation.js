const mongoose = require('mongoose');

// Donation amounts per level (from client_details.md)
const DONATION_AMOUNTS = {
  1: 300,
  2: 1000,
  3: 2000,
  4: 4000,
  5: 8000,
  6: 16000,
  7: 32000,
  8: 64000,
  9: 128000,
  10: 256000,
};

const donationSchema = new mongoose.Schema(
  {
    donationId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    // Member who paid (upgraded)
    fromMemberId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    fromName: {
      type: String,
      trim: true,
      default: '---',
    },
    // Member who received the donation (eligible upline)
    toMemberId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    toName: {
      type: String,
      trim: true,
      default: '---',
    },
    amount: {
      type: Number,
      required: true,
    },
    // Upgrade level this donation is for (1–10)
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'WAITING_FOR_RECEIVER_CONFIRMATION', 'APPROVED', 'COMPLETED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    // UTR / transaction reference for P2P direct-payment tracking
    utrNumber: {
      type: String,
      trim: true,
    },
    paymentProof: {
      type: String,
    },
    remark: {
      type: String,
      trim: true,
    },
    // Detailed audit trail of skipped members
    skippedMembers: [{ type: mongoose.Schema.Types.Mixed }],
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    walletDebited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

donationSchema.statics.DONATION_AMOUNTS = DONATION_AMOUNTS;

module.exports = mongoose.model('Donation', donationSchema);
