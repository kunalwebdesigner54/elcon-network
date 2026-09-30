const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getBlogList, getBlogById, createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');

const router = express.Router();

// Public routes
router.get('/', getBlogList);
router.get('/:blogId', getBlogById);

// Protected Admin routes
router.post('/', protect, authorize('admin'), createBlog);
router.put('/:blogId', protect, authorize('admin'), updateBlog);
router.delete('/:blogId', protect, authorize('admin'), deleteBlog);

module.exports = router;
