const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  assignStock,
  getAllStocks,
  getMyStock,
  sellProduct,
  getSales,
  verifyDeliveryCode,
  confirmProductDelivery
} = require('../controllers/productFranchiseController');

const router = express.Router();

router.use(protect);

// Admin Routes
router.post('/admin/stock', authorize('admin'), assignStock);
router.get('/admin/stock', authorize('admin'), getAllStocks);

// Franchise Routes
router.get('/stock', getMyStock);
router.post('/sell', sellProduct);
router.get('/sales', getSales);
router.post('/verify-delivery', verifyDeliveryCode);
router.post('/confirm-delivery', confirmProductDelivery);

module.exports = router;
