const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const adminControlsController = require('../controllers/adminControlsController');

// All routes here are protected and require 'admin' role
router.use(protect);
router.use(authorize('admin'));

// Manage Discount Coupons
router.post('/discount-coupon', adminControlsController.manageDiscountCoupon);

// Sub-Admin Management (Require SUPER_ADMIN ideally, but we can do it in the controller or a middleware)
// For simplicity, we can just check if req.user.adminType === 'SUPER_ADMIN' in a tiny middleware here
const requireSuperAdmin = (req, res, next) => {
  if (req.user.adminType !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Super Admin access required' });
  }
  next();
};

router.post('/sub-admins', requireSuperAdmin, adminControlsController.createSubAdmin);
router.get('/sub-admins', requireSuperAdmin, adminControlsController.getSubAdmins);
router.put('/sub-admins/:id', requireSuperAdmin, adminControlsController.updateSubAdmin);
router.delete('/sub-admins/:id', requireSuperAdmin, adminControlsController.deleteSubAdmin);

// Settings
router.post('/change-passwords', adminControlsController.changePasswords);

module.exports = router;
