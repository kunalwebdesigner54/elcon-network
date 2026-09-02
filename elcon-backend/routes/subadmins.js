const express = require('express');
const router = express.Router();
const {
  createSubAdmin,
  getSubAdmins,
  getSubAdminById,
  updateSubAdmin,
  deleteSubAdmin
} = require('../controllers/subAdminController');
const { protect, admin } = require('../middleware/auth');
const authorizePermission = require('../middleware/authorizePermission');

// These routes are strictly for SUPER_ADMIN only
// authorizePermission('manage_subadmins') ensures only authorized admins access these

// List all sub-admins and create new one
router.route('/')
  .post(protect, admin, authorizePermission('manage_subadmins'), createSubAdmin)
  .get(protect, admin, authorizePermission('manage_subadmins'), getSubAdmins);

// Get, update, and delete specific sub-admin
router.route('/:id')
  .get(protect, admin, authorizePermission('manage_subadmins'), getSubAdminById)
  .put(protect, admin, authorizePermission('manage_subadmins'), updateSubAdmin)
  .delete(protect, admin, authorizePermission('manage_subadmins'), deleteSubAdmin);

module.exports = router;
