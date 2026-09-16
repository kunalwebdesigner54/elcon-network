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
