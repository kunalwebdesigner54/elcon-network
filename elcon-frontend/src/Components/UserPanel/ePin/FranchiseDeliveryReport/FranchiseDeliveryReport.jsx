import { useState, useEffect } from 'react';
import { getFranchiseDeliveryReport, verifyJoiningPackageDelivery, getFranchiseStock } from '../../../../api/managementService';
import './FranchiseDeliveryReport.css';
import { formatDate } from '../../../../utils/dateFormatter';

function FranchiseDeliveryReport() {
  const [report, setReport] = useState([]);
  const [stock, setStock] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyModal, setVerifyModal] = useState({ show: false, userId: null, code: '' });
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [reportRes, stockRes] = await Promise.all([
        getFranchiseDeliveryReport(),
        getFranchiseStock()
      ]);
      setReport(reportRes.report || []);
      setStock(stockRes.stock || 0);
    } catch (err) {
      if (err.response?.status === 403) {
          setError('You are not authorized to view this page as you are not an E-Pin Franchise.');
      } else {
          setError('Failed to load franchise delivery report.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyModal.code) {
      setVerifyError('Please enter the delivery OTP');
      return;
    }

    try {
      setVerifyLoading(true);
      setVerifyError('');
      await verifyJoiningPackageDelivery({
        userId: verifyModal.userId,
        deliveryCode: verifyModal.code
      });
      setVerifyModal({ show: false, userId: null, code: '' });
      fetchData(); // Refresh the report
    } catch (err) {
      setVerifyError(err.response?.data?.message || 'Verification failed. Please check the OTP.');
    } finally {
      setVerifyLoading(false);
    }
  };

  if (error && error.includes('not authorized')) {
      return (
        <div className="user-product-page">
            <div className="user-panel">
                <div style={{ padding: '20px', color: '#e74c3c', background: '#fdf3f2', border: '1px solid #e74c3c', borderRadius: '4px' }}>
                    {error}
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="user-product-page">
      <div className="user-panel">
        <h2 className="discount-coupon-heading" style={{ marginBottom: '20px' }}>JOINING PACKAGE DELIVERY REPORT</h2>
        
        {error && <div style={{ color: '#e74c3c', marginBottom: '14px' }}>{error}</div>}
        
        <div className="franchise-stats">
          <div className="stat-card">
            <h3>Total Unused Stock</h3>
            <p>{stock}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Deliveries</h3>
            <p>{report.filter(r => r.deliveryStatus === 'Pending').length}</p>
          </div>
          <div className="stat-card">
            <h3>Completed Deliveries</h3>
            <p>{report.filter(r => r.deliveryStatus === 'Delivered').length}</p>
          </div>
        </div>

        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>User Details</th>
                <th>Joining Package</th>
                <th>Registered At</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                </tr>
              ) : report.length > 0 ? (
                report.map((item, index) => (
                  <tr key={item.userId}>
                    <td>{index + 1}</td>
                    <td>
                      <div><strong>{item.name}</strong></div>
                      <div>ID: {item.memberId}</div>
                      <div>Mob: {item.contactNo}</div>
                    </td>
                    <td>{item.joiningPackage}</td>
                    <td>{formatDate(item.registeredAt)}</td>
                    <td>
                      <span className={`status-badge ${item.deliveryStatus.toLowerCase()}`}>
                        {item.deliveryStatus}
                      </span>
                      {item.deliveryStatus === 'Delivered' && (
                        <div style={{ fontSize: '0.8em', marginTop: '4px', color: '#555' }}>
                          On {formatDate(item.deliveredAt)}
                        </div>
                      )}
                    </td>
                    <td>
                      {item.deliveryStatus === 'Pending' ? (
                        <button 
                          className="verify-btn"
                          onClick={() => setVerifyModal({ show: true, userId: item.userId, code: '' })}
                        >
                          Verify Delivery
                        </button>
                      ) : (
                        <span style={{ color: '#27ae60', fontWeight: 'bold' }}>Verified</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    No delivery records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verify Modal */}
      {verifyModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Verify Delivery OTP</h3>
            <p style={{ marginBottom: '15px', color: '#666', fontSize: '0.9em' }}>
              Ask the user for the 4-digit Delivery Code shown on their dashboard.
            </p>
            {verifyError && <div style={{ color: '#e74c3c', marginBottom: '10px', fontSize: '0.9em' }}>{verifyError}</div>}
            
            <form onSubmit={handleVerify}>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <input
                  type="text"
                  maxLength="4"
                  placeholder="Enter 4-digit code"
                  value={verifyModal.code}
                  onChange={(e) => setVerifyModal({ ...verifyModal, code: e.target.value.replace(/\D/g, '') })}
                  required
                  style={{ width: '100%', padding: '10px', textAlign: 'center', letterSpacing: '4px', fontSize: '1.2em' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" disabled={verifyLoading} style={{ flex: 1, padding: '10px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  {verifyLoading ? 'Verifying...' : 'Verify'}
                </button>
                <button type="button" onClick={() => setVerifyModal({ show: false, userId: null, code: '' })} style={{ flex: 1, padding: '10px', background: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FranchiseDeliveryReport;
