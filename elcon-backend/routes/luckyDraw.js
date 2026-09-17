const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { addWinner, getWinners, toggleHideWinner, deleteWinner } = require('../controllers/luckyDrawController');

const router = express.Router();

router.use(protect);

router.post('/winner', authorize('admin'), addWinner);
router.get('/winners', getWinners); // Accessible by both user and admin
router.patch('/winners/:id/hide', authorize('admin'), toggleHideWinner);
router.delete('/winners/:id', authorize('admin'), deleteWinner);

module.exports = router;
