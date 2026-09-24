const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getNewsPopupList, createNewsPopup, updateNewsPopup, deleteNewsPopup } = require('../controllers/newsPopupController');

const router = express.Router();

router.get('/', getNewsPopupList);
router.post('/', protect, authorize('admin'), createNewsPopup);
router.put('/:newsId', protect, authorize('admin'), updateNewsPopup);
router.delete('/:newsId', protect, authorize('admin'), deleteNewsPopup);

module.exports = router;