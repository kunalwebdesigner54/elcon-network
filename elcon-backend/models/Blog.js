const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    content: { type: String, required: false },
    publishDate: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Published', 'Draft'], default: 'Published' },
    images: { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
