require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Coupon = require('./models/Coupon');
  const coupons = await Coupon.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  console.log('Coupons from DB:', coupons);
  process.exit();
});
