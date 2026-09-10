import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addCategory, updateCategory } from '../../../../api/categoryService';
import { eventEmitter, CATEGORY_EVENTS } from '../../../../utils/eventEmitter';
import '../../Common/AdminLayout.css';

function AddCategory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE'
  });

  const isEditMode = Boolean(location.state?.category);

  useEffect(() => {
    if (isEditMode) {
      const { category } = location.state;
      setFormData({
        name: category.name || '',
        description: category.description || '',
        status: category.status || 'ACTIVE'
      });
    }
  }, [isEditMode, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Category name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updateCategory(location.state.category._id, formData);
        alert("Category updated successfully.");
        eventEmitter.emit(CATEGORY_EVENTS.CATEGORY_UPDATED, formData);
      } else {
        await addCategory(formData);
        alert("Category added successfully.");
        eventEmitter.emit(CATEGORY_EVENTS.CATEGORY_ADDED, formData);
      }
      navigate('/products-package/manage-categories');
    } catch (error) {
      console.error("Error saving category:", error);
      alert(error.message || "Failed to save category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-layout">
      <div className="admin-breadcrumb-row">
        <h2 className="admin-page-heading">{isEditMode ? 'Edit Category' : 'Add Category'}</h2>
        <button className="admin-btn-outline" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="admin-panel" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit} className="admin-form">
          
          <div className="admin-form-group">
            <label className="admin-label">Category Name *</label>
            <input
              type="text"
              name="name"
              className="admin-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Electronics"
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Description</label>
            <textarea
              name="description"
              className="admin-input"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter category description..."
              rows="4"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Status</label>
            <select
              name="status"
              className="admin-input"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="admin-btn-row">
            <button
              type="submit"
              className="admin-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Category' : 'Add Category')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddCategory;
