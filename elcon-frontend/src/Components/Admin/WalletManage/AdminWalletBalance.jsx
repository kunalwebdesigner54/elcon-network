import { useState } from 'react';
import '../Common/AdminLayout.css';
import { manageWalletBalance } from '../../../api/managementService';

function AdminWalletBalance() {
  const [formData, setFormData] = useState({ action: 'add', memberId: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await manageWalletBalance(formData);
      setMessage({ type: 'success', text: `${response.message}. New balance: ₹${Number(response.newBalance || 0).toFixed(2)}` });
      setFormData((current) => ({ ...current, amount: '' }));
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to update wallet balance' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel admin-products-panel">
      <h2 className="section-title admin-products-section-title">MEMBER WALLET BALANCE</h2>
      {message && <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>{message.text}</div>}
      <form onSubmit={handleSubmit} className="admin-add-product-form">
        <div className="form-group row">
          <label className="col-sm-3 col-form-label">Action <span>*</span></label>
          <div className="col-sm-9">
            <select className="select-input" value={formData.action} onChange={(event) => setFormData({ ...formData, action: event.target.value })}>
              <option value="add">Add Balance</option>
              <option value="debit">Debit Balance</option>
            </select>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-3 col-form-label">Member ID <span>*</span></label>
          <div className="col-sm-9">
            <input className="text-input" value={formData.memberId} onChange={(event) => setFormData({ ...formData, memberId: event.target.value })} required />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-3 col-form-label">Amount (₹) <span>*</span></label>
          <div className="col-sm-9">
            <input type="number" min="0.01" step="0.01" className="text-input" value={formData.amount} onChange={(event) => setFormData({ ...formData, amount: event.target.value })} required />
          </div>
        </div>
        <div className="form-actions" style={{ marginTop: '20px', textAlign: 'center' }}>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Processing...' : 'Update Wallet'}</button>
        </div>
      </form>
    </section>
  );
}

export default AdminWalletBalance;
