const mongoose = require('mongoose');

const epinPackageSchema = new mongoose.Schema(
  {
    packageName: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EpinPackage', epinPackageSchema);
