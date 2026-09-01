const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getPlanSetting, updatePlanSetting, getBankAccount, updateBankAccount, getTermsAndConditions, updateTermsAndConditions, getGlobalSettings, updateGlobalSettings } = require('../controllers/settingsController');

const router = express.Router();

router.get('/global', getGlobalSettings); // Unprotected for registration page

router.use(protect);

router.put('/global', authorize('admin'), updateGlobalSettings);

router.get('/plan', authorize('admin'), getPlanSetting);
router.put('/plan', authorize('admin'), updatePlanSetting);
router.get('/bank-account', getBankAccount);
router.put('/bank-account', authorize('admin'), updateBankAccount);

router.get('/terms-and-conditions', getTermsAndConditions);
router.put('/terms-and-conditions', authorize('admin'), updateTermsAndConditions);

module.exports = router;