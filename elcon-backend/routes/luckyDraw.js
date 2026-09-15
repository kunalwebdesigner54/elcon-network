const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { addWinner, getWinners } = require('../controllers/luckyDrawController');

const router = express.Router();

router.use(protect);

router.post('/winner', authorize('admin'), addWinner);
router.get('/winners', getWinners); // Accessible by both user and admin

module.exports = router;
