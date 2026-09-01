const express = require('express');
const router = express.Router();
const {
  updateAdminPassword,
  updateAdminTransactionPassword
} = require('../controllers/adminProfileController');
const { protect, admin } = require('../middleware/auth');

router.put('/password', protect, admin, updateAdminPassword);
router.put('/transaction-password', protect, admin, updateAdminTransactionPassword);

module.exports = router;
