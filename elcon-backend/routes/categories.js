const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const authorizePermission = require('../middleware/authorizePermission');

// Protected admin routes
router.route('/')
  .post(protect, authorize('admin'), authorizePermission('manage_products'), createCategory)
  .get(protect, authorize('admin'), getCategories);

router.route('/:id')
  .put(protect, authorize('admin'), authorizePermission('manage_products'), updateCategory)
  .delete(protect, authorize('admin'), authorizePermission('manage_products'), deleteCategory);

module.exports = router;
