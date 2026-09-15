const mongoose = require('mongoose');

const luckyDrawWinnerSchema = new mongoose.Schema(
  {
    serialNo: {
      type: Number,
      required: true,
    },
    memberId: {
      type: String,
      required: true,
      trim: true,
    },
    memberName: {
      type: String,
      required: true,
      trim: true,
    },
    drawDate: {
      type: Date,
      required: true,
    },
    rewardName: {
      type: String,
      required: true,
      trim: true,
    },
    rewardImage: {
      type: String, // Data URL or external URL
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LuckyDrawWinner', luckyDrawWinnerSchema);
