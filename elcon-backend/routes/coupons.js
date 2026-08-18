const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getMyCoupons,
  getAllCoupons,
  getCouponStats,
} = require('../controllers/couponsController');

const router = express.Router();

router.use(protect);

router.get('/stats', getCouponStats);
router.get('/my', getMyCoupons);
router.get('/', authorize('admin'), getAllCoupons);

module.exports = router;