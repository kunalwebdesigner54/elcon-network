const LuckyDrawWinner = require('../models/LuckyDrawWinner');
const User = require('../models/User');

exports.addWinner = async (req, res) => {
  try {
    const { serialNo, memberId, memberName, drawDate, rewardName, rewardImage, transactionPassword } = req.body;

    // Verify Admin transaction password
    const adminUser = await User.findById(req.user.id).select('+transactionPassword');

    if (!adminUser) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }

    const isMatch = await adminUser.matchTransactionPassword(transactionPassword);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid transaction password' });
    }

    const winner = await LuckyDrawWinner.create({
      serialNo: Number(serialNo),
      memberId,
      memberName,
      drawDate: new Date(drawDate),
      rewardName,
      rewardImage,
    });

    res.status(201).json({ success: true, winner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWinners = async (req, res) => {
  try {
    const winnersRaw = await LuckyDrawWinner.find().sort({ createdAt: -1 });
    
    const winners = winnersRaw.map((w, index) => ({
      sNo: w.serialNo || index + 1,
      memberId: w.memberId,
      name: w.memberName,
      date: w.drawDate ? w.drawDate.toISOString().split('T')[0] : '---',
      rewardName: w.rewardName,
      rewardImage: w.rewardImage,
    }));

    res.json({ success: true, winners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
