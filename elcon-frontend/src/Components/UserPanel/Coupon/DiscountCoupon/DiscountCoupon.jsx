import { useState, useEffect } from 'react';
import { getMyCoupons } from '../../../../api/couponsService';
import './DiscountCoupon.css';

const statusClass = {
  ACTIVE: 'history-status history-status-active',
  USED: 'history-status history-status-used',
  EXPIRED: 'history-status history-status-expired'
};

function DiscountCoupon() {
  const [couponCards, setCouponCards] = useState([]);
  const [couponHistory, setCouponHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await getMyCoupons();
      const coupons = Array.isArray(data) ? data : (data.data ? data.data : []);

      // Transform coupons for card display
      const cards = coupons.map((coupon) => {
        const status = coupon.status || 'ACTIVE';
        const themeClass = `coupon-card-${status.toLowerCase()}`;
        const dateText = status === 'USED' 
          ? `Used on ${coupon.usedDate ? new Date(coupon.usedDate).toLocaleDateString('en-IN') : 'N/A'}`
          : status === 'EXPIRED'
          ? `Expired on ${coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString('en-IN') : 'N/A'}`
          : `Valid Till ${coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString('en-IN') : 'N/A'}`;

        return {
          id: coupon.couponCode || `CPN${coupon._id}`,
          type: status,
          themeClass,
          amount: `₹${coupon.amount || 0}`,
          badge: status,
          validText: 'Valid on Shopping Products Only',
          dateText,
          buttonText: status === 'EXPIRED' ? 'Expired' : (status === 'USED' ? 'View Details' : 'Use Now')
        };
      });

      setCouponCards(cards);

      // Transform coupons for history table
      const history = coupons.map((coupon) => ({
        id: coupon.couponCode || `CPN${coupon._id}`,
        amount: `₹${coupon.amount || 0}.00`,
        createdDate: coupon.createdAt ? new Date(coupon.createdAt).toLocaleDateString('en-IN') : 'N/A',
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString('en-IN') : 'N/A',
        usedDate: coupon.usedDate ? new Date(coupon.usedDate).toLocaleDateString('en-IN') : '-',
        usedInOrder: coupon.usedInOrder || '-',
        status: coupon.status || 'ACTIVE'
      }));

      setCouponHistory(history);
      setError('');
    } catch (err) {
      setError('Failed to load coupons');
      console.error(err);
      setCouponCards([]);
      setCouponHistory([]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="discount-coupon-page user-product-page">
      <div className="user-panel discount-coupon-shell">
        {error && <div style={{ color: '#e74c3c', marginBottom: '14px' }}>{error}</div>}
        {loading && <div style={{ color: '#666', marginBottom: '14px' }}>Loading coupons...</div>}

        {!loading && (
          <>
            <section className="discount-coupon-card-section">
              <h2 className="discount-coupon-heading">DISCOUNT COUPON</h2>
              <div className="discount-coupon-cards">
                {couponCards.map((coupon) => (
                  <article key={coupon.id} className={`coupon-card ${coupon.themeClass}`}>
                    <div className="coupon-card-left">
                      <div className="coupon-icon">🛍</div>
                      <div className="coupon-left-label">DISCOUNT COUPON</div>
                    </div>

                    <div className="coupon-card-right">
                      <div className="coupon-top-row">
                        <div>
                          <div className="coupon-code-label">COUPON CODE</div>
                          <div className="coupon-code">{coupon.id}</div>
                        </div>
                        <button type="button" className="coupon-menu-btn" aria-label="Coupon actions">⋮</button>
                      </div>

                      <div className="coupon-offer-row">
                        <span className="coupon-amount">{coupon.amount}</span>
                        <span className="coupon-off-text">OFF</span>
                      </div>
                      <p className="coupon-on-shopping">ON SHOPPING</p>

                      <div className="coupon-info-row">🛒 <span>{coupon.validText}</span></div>
                      <div className="coupon-info-row">📅 <span>{coupon.dateText}</span></div>

                      <button type="button" className={`coupon-action-btn ${coupon.themeClass}`}>{coupon.buttonText}</button>
                    </div>

                    <div className="coupon-status-tag">{coupon.badge}</div>
                  </article>
                ))}
              </div>

              {couponCards.length === 0 && !loading && (
                <div style={{ color: '#999', padding: '20px', textAlign: 'center' }}>No coupons available</div>
              )}

              <div className="coupon-caption-row">
                <span className="coupon-caption coupon-caption-active">Active Coupon</span>
                <span className="coupon-caption coupon-caption-used">Used Coupon</span>
                <span className="coupon-caption coupon-caption-expired">Expired Coupon</span>
              </div>
            </section>

            <section className="discount-coupon-history-section">
              <h2 className="discount-coupon-history-heading">DISCOUNT COUPON HISTORY</h2>

          <div className="table-wrap coupon-history-wrap">
            <table className="user-table coupon-history-table">
              <thead>
                <tr>
                  <th>COUPON ID</th>
                  <th>AMOUNT</th>
                  <th>CREATED DATE</th>
                  <th>EXPIRY DATE</th>
                  <th>USED DATE</th>
                  <th>USED IN ORDER</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {couponHistory.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.amount}</td>
                    <td>{row.createdDate}</td>
                    <td>{row.expiryDate}</td>
                    <td>{row.usedDate}</td>
                    <td>{row.usedInOrder}</td>
                    <td><span className={statusClass[row.status]}>{row.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default DiscountCoupon;