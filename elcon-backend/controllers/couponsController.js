const Coupon = require('../models/Coupon');

const { formatDate, formatDateOnly } = require('../utils/dateFormatter');

const formatCoupon = (coupon, index = 0) => {
  const isExpired = coupon.status === 'ACTIVE' && new Date(coupon.expiryDate) <= new Date();
  return {
    sNo: index + 1,
    couponId: coupon.couponId,
    memberId: coupon.memberId,
    memberName: coupon.memberName,
    amount: Number(coupon.amount || 0).toFixed(2),
    createdDate: formatDate(coupon.createdAt),
    expiryDate: formatDate(coupon.expiryDate),
    usedDate: coupon.usedDate ? formatDate(coupon.usedDate) : '-',
    usedInOrder: coupon.usedInOrder || '-',
    status: isExpired ? 'EXPIRED' : coupon.status,
  };
};

exports.getMyCoupons = async (req, res) => {
  try {
    const memberId = req.user.memberId;
    const coupons = await Coupon.find({ memberId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: coupons.map((coupon, index) => formatCoupon(coupon, index)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const { couponId, memberId, memberName, usedInOrder, status, startDate, endDate } = req.query;
    const filter = {};

    if (couponId) filter.couponId = new RegExp(couponId.trim(), 'i');
    if (memberId) filter.memberId = new RegExp(memberId.trim(), 'i');
    if (memberName) filter.memberName = new RegExp(memberName.trim(), 'i');
    if (usedInOrder) filter.usedInOrder = new RegExp(usedInOrder.trim(), 'i');
    if (status) {
      const s = status.toUpperCase();
      if (s === 'ACTIVE') {
        filter.status = 'ACTIVE';
        filter.expiryDate = { $gt: new Date() };
      } else if (s === 'EXPIRED') {
        filter.$or = [
          { status: 'EXPIRED' },
          { status: 'ACTIVE', expiryDate: { $lte: new Date() } }
        ];
      } else {
        filter.status = s;
      }
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const coupons = await Coupon.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: coupons.length,
      data: coupons.map((coupon, index) => formatCoupon(coupon, index)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCouponStats = async (req, res) => {
  try {
    const [totalCoupons, activeCoupons, usedCoupons, expiredCoupons] = await Promise.all([
      Coupon.countDocuments(),
      Coupon.countDocuments({ status: 'ACTIVE', expiryDate: { $gt: new Date() } }),
      Coupon.countDocuments({ status: 'USED' }),
      Coupon.countDocuments({
        $or: [
          { status: 'EXPIRED' },
          { status: 'ACTIVE', expiryDate: { $lte: new Date() } }
        ]
      }),
    ]);

    const totalDiscount = await Coupon.aggregate([
      { $match: { status: 'USED' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCoupons,
        activeCoupons,
        usedCoupons,
        expiredCoupons,
        totalDiscount: totalDiscount[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};