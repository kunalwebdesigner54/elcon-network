const express = require('express');
const router = express.Router();
const {
  createSubAdmin,
  getSubAdmins,
  updateSubAdmin
} = require('../controllers/subAdminController');
const { protect, admin } = require('../middleware/auth');
const authorizePermission = require('../middleware/authorizePermission');

// These routes are strictly for SUPER_ADMIN only
// authorizePermission isn't strictly necessary here if we handle it in middleware, 
// but we can ensure only SUPER_ADMIN reaches these by using a custom middleware or checking in the controller.
// We will use authorizePermission('manage_subadmins') assuming SUPER_ADMIN bypasses it.

router.route('/')
  .post(protect, admin, authorizePermission('manage_subadmins'), createSubAdmin)
  .get(protect, admin, authorizePermission('manage_subadmins'), getSubAdmins);

router.route('/:id')
  .put(protect, admin, authorizePermission('manage_subadmins'), updateSubAdmin);

module.exports = router;
