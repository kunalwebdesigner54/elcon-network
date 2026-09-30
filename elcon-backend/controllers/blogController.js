const Blog = require('../models/Blog');

exports.getBlogList = async (req, res) => {
  try {
    const rows = await Blog.find({}).sort({ createdAt: -1 });
    res.json({ 
      success: true, 
      items: rows.map(doc => ({
        id: doc._id,
        _id: doc._id,
        title: doc.title,
        description: doc.description,
        content: doc.content,
        publishDate: doc.publishDate,
        status: doc.status,
        images: doc.images
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const item = await Blog.findById(req.params.blogId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const payload = req.body || {};
    const item = await Blog.create({
      title: payload.title || 'Untitled',
      description: payload.description || '',
      content: payload.content || '',
      publishDate: payload.publishDate || new Date().toLocaleDateString('en-GB'),
      status: payload.status || 'Published',
      images: Array.isArray(payload.images) ? payload.images.slice(0, 5) : [],
    });
    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const item = await Blog.findById(req.params.blogId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    
    Object.assign(item, req.body || {});
    if (req.body && Array.isArray(req.body.images)) {
      item.images = req.body.images.slice(0, 5);
    }
    
    await item.save();
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const item = await Blog.findById(req.params.blogId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    await item.deleteOne();
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
