const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getPlanSetting, updatePlanSetting, getBankAccount, updateBankAccount, getTermsAndConditions, updateTermsAndConditions, getGlobalSettings, updateGlobalSettings, getBranding, updateBranding } = require('../controllers/settingsController');

const router = express.Router();

router.get('/global', getGlobalSettings); // Unprotected for registration page
router.get('/branding', getBranding); // Unprotected for public pages

router.use(protect);

router.put('/global', authorize('admin'), updateGlobalSettings);
router.put('/branding', authorize('admin'), updateBranding);

router.get('/plan', getPlanSetting);
router.put('/plan', authorize('admin'), updatePlanSetting);
router.get('/bank-account', getBankAccount);
router.put('/bank-account', authorize('admin'), updateBankAccount);

router.get('/terms-and-conditions', getTermsAndConditions);
router.put('/terms-and-conditions', authorize('admin'), updateTermsAndConditions);

module.exports = router;