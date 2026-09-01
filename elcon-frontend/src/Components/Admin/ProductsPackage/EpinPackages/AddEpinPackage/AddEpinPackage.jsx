import '../../../Common/AdminLayout.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEpinPackage } from '../../../../../api/managementService';

function AddEpinPackage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    packageName: '',
    price: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.packageName || !formData.price) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await createEpinPackage(formData);
      setMessage({ type: 'success', text: 'Package added successfully!' });
      setTimeout(() => navigate('/products-package/epin-packages'), 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add package' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="panel admin-products-panel">
        <h2 className="section-title admin-products-section-title">ADD E-PIN PACKAGE</h2>

        {message && (
          <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-add-product-form">
          <div className="form-group row">
            <label className="col-sm-3 col-form-label">Package Name <span>*</span></label>
            <div className="col-sm-9">
              <input
                type="text"
                name="packageName"
                className="text-input"
                placeholder="Enter Package Name"
                value={formData.packageName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group row">
            <label className="col-sm-3 col-form-label">Price (₹) <span>*</span></label>
            <div className="col-sm-9">
              <input
                type="number"
                name="price"
                className="text-input"
                placeholder="Enter Package Price"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', width: '100%' }}>
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)} style={{ flex: 1, textTransform: 'uppercase' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, textTransform: 'uppercase' }}>
              {loading ? 'Saving...' : 'Save Package'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AddEpinPackage;
