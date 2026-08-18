const express = require('express');
const { body, param } = require('express-validator');
const {
  getDonationTarget,
  upgradeMember,
  submitDonation,
  updateDonationStatus,
  getMyDonations,
  getAllDonations,
  getDonationStats,
} = require('../controllers/donationsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/donations/stats  — admin or user stats
router.get('/stats', getDonationStats);

// GET /api/donations/my  — logged-in user's sent & received donations
router.get('/my', getMyDonations);

// GET /api/donations/target/:level  — who should this user pay for a given level?
router.get(
  '/target/:level',
  [param('level').isInt({ min: 1, max: 10 }).withMessage('Level must be 1–10')],
  getDonationTarget
);

// POST /api/donations/upgrade  — wallet-based upgrade (auto-confirmed)
router.post(
  '/upgrade',
  [body('level').isInt({ min: 1, max: 10 }).withMessage('Level must be 1–10')],
  upgradeMember
);

// POST /api/donations/submit  — P2P direct-payment submission (pending admin approval)
router.post(
  '/submit',
  [
    body('level').isInt({ min: 1, max: 10 }).withMessage('Level must be 1–10'),
    body('utrNumber').optional().trim(),
  ],
  submitDonation
);

// PATCH /api/donations/:donationId/status  — admin: approve / reject pending donation
router.patch(
  '/:donationId/status',
  authorize('admin'),
  [
    param('donationId').trim().notEmpty().withMessage('Donation ID is required'),
    body('status').isIn(['COMPLETED', 'REJECTED']).withMessage('Status must be COMPLETED or REJECTED'),
  ],
  updateDonationStatus
);

// GET /api/donations  — admin: all donations with optional filters
router.get('/', authorize('admin'), getAllDonations);

module.exports = router;
