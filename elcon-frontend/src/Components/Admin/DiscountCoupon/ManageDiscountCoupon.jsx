import React, { useState, useRef } from 'react';
import "../Common/AdminLayout.css";
import { manageDiscountCoupon } from "../../../api/managementService";
import { getMemberInfoByUserId } from "../../../api/membersService";

function ManageDiscountCoupon() {
  const [formData, setFormData] = useState({
    action: 'add',
    target: 'single',
    memberId: '',
    amount: '',
    transactionPassword: ''
  });
  const [memberName, setMemberName] = useState('');
  const [memberFetchStatus, setMemberFetchStatus] = useState(null); // null | 'loading' | 'found' | 'not_found'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const fetchDebounceRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Reset member name if memberId changes
    if (name === 'memberId') {
      setMemberName('');
      setMemberFetchStatus(null);
    }
  };

  const handleMemberIdBlur = async () => {
    const id = formData.memberId.trim();
    if (!id || formData.target !== 'single') return;

    setMemberFetchStatus('loading');
    setMemberName('');

    try {
      const res = await getMemberInfoByUserId(id);
      if (res?.success && res?.data?.name) {
        setMemberName(res.data.name);
        setMemberFetchStatus('found');
      } else {
        setMemberName('');
        setMemberFetchStatus('not_found');
      }
    } catch {
      setMemberName('');
      setMemberFetchStatus('not_found');
    }
  };

  const handleTargetChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, target: value, memberId: '', transactionPassword: '' }));
    setMemberName('');
    setMemberFetchStatus(null);
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
    if (!formData.transactionPassword) {
      setMessage({ type: 'error', text: 'Transaction password is required' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await manageDiscountCoupon(formData);
      if (res.success) {
        setMessage({ type: 'success', text: res.message });
        setFormData(prev => ({ ...prev, memberId: '', amount: '', transactionPassword: '' }));
        setMemberName('');
        setMemberFetchStatus(null);
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
              <select name="target" className="select-input" value={formData.target} onChange={handleTargetChange} required>
                <option value="single">Single User</option>
                <option value="bulk">Bulk (All Active Users)</option>
              </select>
            </div>
          </div>

          {formData.target === 'single' && (
            <>
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
                    onBlur={handleMemberIdBlur}
                    required={formData.target === 'single'}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="form-group row">
                <label className="col-sm-3 col-form-label">Member Name</label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="text-input"
                    readOnly
                    placeholder={
                      memberFetchStatus === 'loading'
                        ? 'Fetching...'
                        : memberFetchStatus === 'not_found'
                        ? 'Member not found'
                        : 'Auto-fetched from Member ID'
                    }
                    value={memberName}
                    style={{
                      background: 'var(--input-bg, #1e2535)',
                      color: memberFetchStatus === 'not_found' ? '#e74c3c' : memberFetchStatus === 'found' ? '#27ae60' : undefined,
                      cursor: 'default'
                    }}
                  />
                </div>
              </div>
            </>
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

          <div className="form-group row">
            <label className="col-sm-3 col-form-label">Transaction Password <span>*</span></label>
            <div className="col-sm-9">
              <input
                type="password"
                name="transactionPassword"
                className="text-input"
                placeholder="Enter Transaction Password"
                value={formData.transactionPassword}
                onChange={handleChange}
                required
                autoComplete="current-password"
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
