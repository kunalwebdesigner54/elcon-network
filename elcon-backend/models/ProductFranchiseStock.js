const mongoose = require('mongoose');

const productFranchiseStockSchema = new mongoose.Schema(
  {
    franchiseId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Ensure unique composite index for franchiseId and productId
productFranchiseStockSchema.index({ franchiseId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('ProductFranchiseStock', productFranchiseStockSchema);
