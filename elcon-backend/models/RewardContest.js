const mongoose = require('mongoose');

const rewardContestSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    targetDirects: {
      type: Number,
      required: true,
      default: 0,
    },
    targetUpgradeLevel: {
      type: Number,
      required: true,
      default: 1,
    },
    rewardName: {
      type: String,
      required: true,
      trim: true,
    },
    popupImage: {
      type: String, // Data URL or external URL
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RewardContest', rewardContestSchema);
