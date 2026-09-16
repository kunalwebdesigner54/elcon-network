const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createContest, getActiveContest, getQualifiers, updateContest, deleteContest } = require('../controllers/rewardsController');

const router = express.Router();

router.use(protect);

router.post('/contest', authorize('admin'), createContest);
router.put('/contest/:id', authorize('admin'), updateContest);
router.delete('/contest/:id', authorize('admin'), deleteContest);
router.get('/contest/active', getActiveContest);   // Accessible by both user and admin
router.get('/qualifiers', getQualifiers);           // Accessible by both user and admin

module.exports = router;
