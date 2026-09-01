const Category = require('../models/Category');

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      description,
      status: status || 'ACTIVE',
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if new name exists in other categories
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already in use' });
      }
      category.name = name;
    }

    if (description !== undefined) category.description = description;
    if (status !== undefined) category.status = status;

    await category.save();

    res.status(200).json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Category.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: 'Category removed' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
