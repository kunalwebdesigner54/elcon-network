import { useState } from 'react';
import { verifyDeliveryCode, confirmProductDelivery } from "../../../api/managementService";
import "../Common/UserLayout.css";
import './FranchiseStyles.css';

function VerifyDelivery() {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setError('Please enter a verification code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setOrderData(null);

    try {
      const response = await verifyDeliveryCode({ code: verificationCode.trim() });
      if (response.success) {
        setOrderData(response.order);
        setSuccess('Verification Code is valid!');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid Verification Code or Order is not Pending');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    setConfirming(true);
    setError('');
    setSuccess('');
    try {
      const response = await confirmProductDelivery({ code: verificationCode.trim() });
      if (response.success) {
        setSuccess('Product Delivery Confirmed Successfully!');
        setOrderData(null);
        setVerificationCode('');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to confirm delivery');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="user-panel-page">
      <div className="user-panel-card">
        <div className="user-panel-card-header">
          <h2 className="user-panel-card-title">Verify Product Delivery</h2>
        </div>
        <div className="user-panel-card-body">
          {error && <div className="alert alert-danger" style={{ padding: '15px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}
          {success && <div className="alert alert-success" style={{ padding: '15px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', marginBottom: '20px' }}>{success}</div>}

          <form className="admin-form" onSubmit={handleVerify} style={{ marginBottom: '30px' }}>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1, maxWidth: '400px' }}>
                <label>Member's 6-Digit Verification Code</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter Code"
                    maxLength={6}
                    style={{ padding: '10px', flex: 1, fontSize: '1.2rem', letterSpacing: '2px', textAlign: 'center' }}
                    required
                  />
                  <button type="submit" className="admin-btn-primary" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {orderData && (
            <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '20px', background: '#fafafa' }}>
              <h3 style={{ marginBottom: '15px', color: '#333' }}>Order Details Verified</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <small style={{ color: '#777', display: 'block' }}>Order No</small>
                  <strong>{orderData.orderNo}</strong>
                </div>
                <div>
                  <small style={{ color: '#777', display: 'block' }}>Order Date</small>
                  <strong>{orderData.orderDate}</strong>
                </div>
                <div>
                  <small style={{ color: '#777', display: 'block' }}>Total Price</small>
                  <strong>₹{orderData.totalPrice}</strong>
                </div>
                <div>
                  <small style={{ color: '#777', display: 'block' }}>Member ID</small>
                  <strong>{orderData.user?.memberId}</strong>
                </div>
                <div>
                  <small style={{ color: '#777', display: 'block' }}>Member Name</small>
                  <strong>{orderData.user?.name}</strong>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '10px' }}>Items to Deliver:</h4>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Quantity</th>
                      <th>Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(orderData.items || []).map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.totalPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
                <button 
                  type="button" 
                  className="admin-btn-secondary"
                  onClick={() => { setOrderData(null); setVerificationCode(''); setSuccess(''); setError(''); }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="admin-btn-primary" 
                  onClick={handleConfirmDelivery}
                  disabled={confirming}
                  style={{ background: '#2e7d32', borderColor: '#2e7d32' }}
                >
                  {confirming ? 'Confirming...' : 'Confirm Delivery & Handover Products'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default VerifyDelivery;
