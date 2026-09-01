import React, { useState } from 'react';
import "../Common/AdminLayout.css";
import { changeAdminPasswords } from "../../../api/managementService";

function AdminSettings() {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'transaction'
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirm password do not match' });
      return;
    }
    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await changeAdminPasswords({
        type: activeTab,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      if (res.success) {
        setMessage({ type: 'success', text: res.message });
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: res.message || 'Operation failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Server error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="panel admin-products-panel">
        <h2 className="section-title admin-products-section-title">ADMIN SETTINGS</h2>

        <div className="settings-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            type="button" 
            className={activeTab === 'login' ? 'btn-primary' : 'btn-secondary'} 
            onClick={() => { setActiveTab('login'); setMessage(null); setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' }); }}
          >
            Change Login Password
          </button>
          <button 
            type="button" 
            className={activeTab === 'transaction' ? 'btn-primary' : 'btn-secondary'} 
            onClick={() => { setActiveTab('transaction'); setMessage(null); setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' }); }}
          >
            Change Transaction Password
          </button>
        </div>

        {message && (
          <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-add-product-form">
          <div className="form-group row">
            <label className="col-sm-3 col-form-label">Old Password <span>*</span></label>
            <div className="col-sm-9">
              <input
                type="password"
                name="oldPassword"
                className="text-input"
                placeholder="Enter Old Password (or leave blank if first time for transaction password)"
                value={formData.oldPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group row">
            <label className="col-sm-3 col-form-label">New Password <span>*</span></label>
            <div className="col-sm-9">
              <input
                type="password"
                name="newPassword"
                className="text-input"
                placeholder="Enter New Password"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group row">
            <label className="col-sm-3 col-form-label">Confirm Password <span>*</span></label>
            <div className="col-sm-9">
              <input
                type="password"
                name="confirmPassword"
                className="text-input"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '20px', textAlign: 'center' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Update Password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AdminSettings;
