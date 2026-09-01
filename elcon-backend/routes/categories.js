const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');
const authorizePermission = require('../middleware/authorizePermission');

// Protected admin routes
router.route('/')
  .post(protect, admin, authorizePermission('manage_products'), createCategory)
  .get(protect, admin, getCategories);

router.route('/:id')
  .put(protect, admin, authorizePermission('manage_products'), updateCategory)
  .delete(protect, admin, authorizePermission('manage_products'), deleteCategory);

module.exports = router;
