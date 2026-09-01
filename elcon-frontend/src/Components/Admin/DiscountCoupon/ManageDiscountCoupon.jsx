import React, { useState } from 'react';
import '../../Common/AdminLayout.css';
import { manageDiscountCoupon } from '../../../../api/managementService';

function ManageDiscountCoupon() {
  const [formData, setFormData] = useState({
    action: 'add',
    target: 'single',
    memberId: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }
    if (formData.target === 'single' && !formData.memberId) {
      setMessage({ type: 'error', text: 'Member ID is required for single user' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await manageDiscountCoupon(formData);
      if (res.success) {
        setMessage({ type: 'success', text: res.message });
        setFormData(prev => ({ ...prev, memberId: '', amount: '' }));
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
        <h2 className="section-title admin-products-section-title">MANAGE DISCOUNT COUPON</h2>

        {message && (
          <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-add-product-form">
          <div className="form-group row">
            <label className="col-sm-3 col-form-label">Action <span>*</span></label>
            <div className="col-sm-9">
              <select name="action" className="select-input" value={formData.action} onChange={handleChange} required>
                <option value="add">Add Coupon Balance</option>
                <option value="debit">Debit Coupon Balance</option>
              </select>
            </div>
          </div>

          <div className="form-group row">
            <label className="col-sm-3 col-form-label">Target <span>*</span></label>
            <div className="col-sm-9">
              <select name="target" className="select-input" value={formData.target} onChange={handleChange} required>
                <option value="single">Single User</option>
                <option value="bulk">Bulk (All Active Users)</option>
              </select>
            </div>
          </div>

          {formData.target === 'single' && (
            <div className="form-group row">
              <label className="col-sm-3 col-form-label">Member ID <span>*</span></label>
              <div className="col-sm-9">
                <input
                  type="text"
                  name="memberId"
                  className="text-input"
                  placeholder="Enter Member ID"
                  value={formData.memberId}
                  onChange={handleChange}
                  required={formData.target === 'single'}
                />
              </div>
            </div>
          )}

          <div className="form-group row">
            <label className="col-sm-3 col-form-label">Amount (₹) <span>*</span></label>
            <div className="col-sm-9">
              <input
                type="number"
                name="amount"
                className="text-input"
                placeholder="Enter Amount"
                min="1"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '20px', textAlign: 'center' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Submit'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ManageDiscountCoupon;
