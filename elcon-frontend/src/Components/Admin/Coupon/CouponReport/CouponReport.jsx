import { useMemo, useState, useEffect } from 'react';
import { getAllCoupons } from '../../../../api/couponsService';
import './CouponReport.css';

const statusClass = {
  ACTIVE: 'status-pill status-pill-active',
  USED: 'status-pill status-pill-used',
  EXPIRED: 'status-pill status-pill-expired'
};

function CouponReport() {
  const [couponRows, setCouponRows] = useState([]);
  const [filters, setFilters] = useState({ couponId: '', memberId: '', memberName: '', usedInOrder: '', usedDate: '', status: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await getAllCoupons();
      const coupons = Array.isArray(data) ? data : (data.data ? data.data : []);
      setCouponRows(coupons.map((coupon, index) => ({
        sno: index + 1,
        couponId: coupon.couponCode || 'N/A',
        memberId: coupon.memberId?.memberId || 'N/A',
        memberName: coupon.memberId?.userName || 'N/A',
        amount: coupon.amount || '0',
        usedInOrder: coupon.usedInOrder || '-',
        usedDate: coupon.usedDate ? new Date(coupon.usedDate).toLocaleDateString('en-IN') : '-',
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString('en-IN') : '-',
        status: coupon.status || 'ACTIVE'
      })));
      setError('');
    } catch (err) {
      setError('Failed to load coupons');
      console.error(err);
      setCouponRows([]);
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => {
    return couponRows.filter((row) => {
      const values = [row.couponId, row.memberId, row.memberName, row.usedInOrder, row.usedDate, row.status].join(' ').toLowerCase();
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return values.includes(value.toLowerCase()) || String(row[key] || '').toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [filters]);

  const updateFilter = (key) => (event) => setFilters((previous) => ({ ...previous, [key]: event.target.value }));

  return (
    <div className="coupon-report-page">
    

      <section className="coupon-report-panel">
        <h2 className="coupon-report-heading">DISCOUNT COUPON</h2>

        {error && <div style={{ color: '#e74c3c', marginBottom: '14px' }}>{error}</div>}
        {loading && <div style={{ color: '#666', marginBottom: '14px' }}>Loading coupons...</div>}

        {!loading && (
          <>
            <div className="coupon-report-toolbar">
              <div className="coupon-filter-row">
                <input className="coupon-filter-input" placeholder="COUPON ID" value={filters.couponId} onChange={updateFilter('couponId')} />
                <input className="coupon-filter-input" placeholder="MEMBER ID" value={filters.memberId} onChange={updateFilter('memberId')} />
                <input className="coupon-filter-input" placeholder="MEMBER NAME" value={filters.memberName} onChange={updateFilter('memberName')} />
                <input className="coupon-filter-input" placeholder="USED IN ORDER" value={filters.usedInOrder} onChange={updateFilter('usedInOrder')} />
                <input className="coupon-filter-input" placeholder="USED DATE" value={filters.usedDate} onChange={updateFilter('usedDate')} />
                <select className="coupon-filter-input coupon-status-select" value={filters.status} onChange={updateFilter('status')}>
                  <option value="">STATUS</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="USED">USED</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
                <button type="button" className="btn-primary coupon-search-btn">SEARCH</button>
              </div>

              
            </div>

            <div className="btn-row tds-export-row" aria-label="Export options">
              <button type="button" className="btn-outline tds-export-btn" aria-label="Export Excel">XLS</button>
              <button type="button" className="btn-outline tds-export-btn" aria-label="Export PDF">PDF</button>
            </div>

            <div className="table-wrap coupon-table-wrap">
              <table className="data-table coupon-table">
                <thead>
                  <tr>
                    <th>S.NO</th>
                    <th>COUPON ID</th>
                    <th>MEMBER ID</th>
                    <th>MEMBER NAME</th>
                    <th>AMOUNT</th>
                    <th>USED IN ORDER</th>
                    <th>USED DATE</th>
                    <th>EXPIRY DATE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.couponId}>
                      <td>{row.sno}</td>
                      <td>{row.couponId}</td>
                      <td>{row.memberId}</td>
                      <td>{row.memberName}</td>
                      <td>{row.amount}</td>
                      <td>{row.usedInOrder}</td>
                      <td>{row.usedDate}</td>
                      <td>{row.expiryDate}</td>
                      <td><span className={statusClass[row.status]}>{row.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-footer coupon-pagination-wrap">
          <div className="pagination">
            <button type="button" className="page-btn">«</button>
            <button type="button" className="page-btn">‹</button>
            <button type="button" className="page-btn active">1</button>
            <button type="button" className="page-btn">2</button>
            <button type="button" className="page-btn">3</button>
            <button type="button" className="page-btn">4</button>
            <button type="button" className="page-btn">5</button>
            <button type="button" className="page-btn">6</button>
            <button type="button" className="page-btn">7</button>
            <button type="button" className="page-btn">›</button>
            <button type="button" className="page-btn">»</button>
          </div>
        </div>
            </>
        )}
      </section>
    </div>
  );
}

export default CouponReport;