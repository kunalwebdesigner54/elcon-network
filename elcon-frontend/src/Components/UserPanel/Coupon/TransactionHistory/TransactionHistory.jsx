import { useState, useEffect } from 'react';
import { getCouponTransactionHistory } from '../../../../api/productsService';
import './TransactionHistory.css';

function TransactionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getCouponTransactionHistory();
      setHistory(data.history || []);
      setError('');
    } catch (err) {
      setError('Failed to load transaction history');
      console.error(err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-product-page">
      <div className="user-panel">
        <h2 className="discount-coupon-heading" style={{ marginBottom: '20px' }}>COUPON TRANSACTION HISTORY</h2>
        
        {error && <div style={{ color: '#e74c3c', marginBottom: '14px' }}>{error}</div>}
        
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Order No</th>
                <th>Date</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Coupon Used (₹)</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                </tr>
              ) : history.length > 0 ? (
                history.map((item, index) => (
                  <tr key={`${item.orderNo}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{item.orderNo}</td>
                    <td>{item.orderDate}</td>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.couponUsed?.toFixed(2) || '0.00'}</td>
                    <td>
                      {item.isLegacy ? (
                        <span style={{ fontSize: '0.85em', color: '#888' }}>Legacy Order (Total)</span>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TransactionHistory;
