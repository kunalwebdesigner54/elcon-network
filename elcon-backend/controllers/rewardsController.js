const RewardContest = require('../models/RewardContest');
const User = require('../models/User');

exports.createContest = async (req, res) => {
  try {
    const { startDate, endDate, targetDirects, targetUpgradeLevel, rewardName, popupImage, transactionPassword } = req.body;

    // Verify Admin transaction password
    const adminUser = await User.findById(req.user.id).select('+transactionPassword');
    
    if (!adminUser) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }

    const isMatch = await adminUser.matchTransactionPassword(transactionPassword);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid transaction password' });
    }

    // Set other active contests to inactive
    await RewardContest.updateMany({}, { isActive: false });

    const contest = await RewardContest.create({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      targetDirects: Number(targetDirects),
      targetUpgradeLevel: Number(targetUpgradeLevel),
      rewardName,
      popupImage,
      isActive: true,
    });

    res.status(201).json({ success: true, contest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActiveContest = async (req, res) => {
  try {
    const contest = await RewardContest.findOne({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, contest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQualifiers = async (req, res) => {
  try {
    const activeContest = await RewardContest.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!activeContest) {
      return res.json({ success: true, qualifiers: [] });
    }

    const qualifiersRaw = await User.aggregate([
      {
        $match: {
          $or: [
            { joiningLevel: { $gte: activeContest.targetUpgradeLevel } },
            { unlockLevel: { $gte: activeContest.targetUpgradeLevel } }
          ],
          accountStatus: 'ACTIVE',
          isBlocked: false,
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { mId: '$memberId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$sponsorId', '$$mId'] },
                    { $gte: ['$createdAt', activeContest.startDate] },
                    { $lte: ['$createdAt', activeContest.endDate] }
                  ]
                }
              }
            }
          ],
          as: 'newDirects'
        }
      },
      {
        $addFields: {
          directsCount: { $size: '$newDirects' }
        }
      },
      {
        $match: {
          directsCount: { $gte: activeContest.targetDirects }
        }
      },
      {
        $project: {
          memberId: 1,
          name: 1,
          city: { $ifNull: ['$city', '---'] }
        }
      }
    ]);

    const qualifiers = qualifiersRaw.map((q, index) => ({
      sNo: index + 1,
      memberId: q.memberId,
      name: q.name,
      city: q.city,
      qualifyDate: activeContest.endDate.toISOString().split('T')[0],
      reward: activeContest.rewardName,
    }));

    res.json({ success: true, qualifiers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateContest = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, targetDirects, targetUpgradeLevel, rewardName, popupImage, transactionPassword } = req.body;

    const adminUser = await User.findById(req.user.id).select('+transactionPassword');
    if (!adminUser) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }
    const isMatch = await adminUser.matchTransactionPassword(transactionPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid transaction password' });
    }

    const contest = await RewardContest.findById(id);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    if (startDate) contest.startDate = new Date(startDate);
    if (endDate) contest.endDate = new Date(endDate);
    if (targetDirects !== undefined) contest.targetDirects = Number(targetDirects);
    if (targetUpgradeLevel !== undefined) contest.targetUpgradeLevel = Number(targetUpgradeLevel);
    if (rewardName) contest.rewardName = rewardName;
    if (popupImage) contest.popupImage = popupImage;

    await contest.save();
    res.json({ success: true, contest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteContest = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionPassword } = req.body;

    const adminUser = await User.findById(req.user.id).select('+transactionPassword');
    if (!adminUser) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }
    const isMatch = await adminUser.matchTransactionPassword(transactionPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid transaction password' });
    }

    const contest = await RewardContest.findByIdAndDelete(id);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    res.json({ success: true, message: 'Contest deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
