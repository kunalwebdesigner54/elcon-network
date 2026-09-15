const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createContest, getActiveContest, getQualifiers } = require('../controllers/rewardsController');

const router = express.Router();

router.use(protect);

router.post('/contest', authorize('admin'), createContest);
router.get('/contest/active', getActiveContest); // Accessible by both user and admin
router.get('/qualifiers', getQualifiers); // Accessible by both user and admin

module.exports = router;
