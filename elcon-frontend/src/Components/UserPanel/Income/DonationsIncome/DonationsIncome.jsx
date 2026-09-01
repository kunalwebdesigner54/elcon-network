import { useState, useEffect, useMemo } from 'react';
import '../../Common/UserLayout.css';
import './DonationsIncome.css';
import { getMyDonations } from '../../../../api/donationsService';

function DonationsIncome() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterMemberId, setFilterMemberId] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [appliedFilters, pageSize]);

  useEffect(() => {
    getMyDonations()
      .then((data) => {
        // received = donations where this user is the receiver (their income)
        setRows(data.data?.received || []);
      })
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load donation income.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (appliedFilters.memberId && !row.fromMemberId?.toLowerCase().includes(appliedFilters.memberId.toLowerCase())) return false;
      if (appliedFilters.level && String(row.level) !== appliedFilters.level) return false;
      if (appliedFilters.from && new Date(row.dateRaw) < new Date(appliedFilters.from)) return false;
      if (appliedFilters.to && new Date(row.dateRaw) > new Date(appliedFilters.to + 'T23:59:59')) return false;
      return true;
    });
  }, [rows, appliedFilters]);

  const totalDonationIncome = filteredRows
    .filter((r) => ['APPROVED', 'COMPLETED'].includes(r.status))
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const handleSearch = () => {
    setAppliedFilters({ memberId: filterMemberId, level: filterLevel, from: filterFrom, to: filterTo });
  };

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <h1 className="user-page-title">Donations Report</h1>
      <div className="user-panel">
        <h3>Total Received Help : ₹ {totalDonationIncome.toLocaleString('en-IN')}</h3>

        <div className="donation-income-filters">
          <input
            className="text-input" type="text" placeholder="DONAR MID"
            value={filterMemberId} onChange={(e) => setFilterMemberId(e.target.value)}
          />
          <select className="select-input" value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
            <option value="">LEVEL</option>
            {[1,2,3,4,5,6,7,8,9,10].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <label className="filter-field">
            <input className="text-input" type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
          </label>
          <label className="filter-field">
            <input className="text-input" type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
          </label>
          <select className="select-input" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} style={{ width: '80px' }}>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="user-btn-blue" type="button" onClick={handleSearch}>Search</button>
        </div>

        <div className="table-toolbar">
          <button className="user-btn-outline" type="button">Excel</button>
          <button className="user-btn-outline" type="button">PDF</button>
        </div>

        {loading && <p style={{ padding: '16px' }}>Loading…</p>}
        {error && <p style={{ color: 'red', padding: '16px' }}>{error}</p>}

        {!loading && !error && (
          <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>DONAR MID</th>
                  <th>DONOR MEMBER NAME</th>
                  <th>DIRECTS</th>
                  <th>LEVEL DEPTH</th>
                  <th>AMOUNT (₹)</th>
                  <th>UPGRADE</th>
                  <th>DONATION ID</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length === 0 ? (
                  <tr><td colSpan={11} style={{ textAlign: 'center', padding: '20px' }}>No donation income records found.</td></tr>
                ) : (
                  visibleRows.map((row, index) => (
                    <tr key={row.donationId || index}>
                      <td>{(page - 1) * pageSize + index + 1}</td>
                      <td>{row.fromMemberId}</td>
                      <td>{row.fromName}</td>
                      <td>{row.directs || 0}</td>
                      <td>{row.level}</td>
                      <td style={{ color: '#27ae60', fontWeight: 'bold' }}>₹ {row.amount?.toLocaleString('en-IN')}</td>
                      <td>Level {row.level}</td>
                      <td>{row.donationId}</td>
                      <td>{row.date}</td>
                      <td>
                        <span style={{
                          color: row.status === 'COMPLETED' ? '#27ae60' : row.status === 'REJECTED' ? '#e74c3c' : '#f39c12',
                          fontWeight: 600,
                        }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="table-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.95em', color: 'var(--text-muted)', fontWeight: '500', paddingLeft: '8px' }}>
              Total: {filteredRows.length} requests
            </span>
            <div className="pagination" style={{ display: 'flex', gap: '6px' }}>
              <button type="button" className="user-page-btn" onClick={() => setPage(1)} disabled={page === 1}>&laquo;</button>
              <button type="button" className="user-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>&lsaquo;</button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let start = Math.max(1, page - 2);
                if (start + 4 > totalPages) start = Math.max(1, totalPages - 4);
                const pageNum = start + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <button 
                    key={pageNum} 
                    type="button"
                    className={`user-page-btn ${page === pageNum ? 'active' : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button type="button" className="user-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>&rsaquo;</button>
              <button type="button" className="user-page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages || totalPages === 0}>&raquo;</button>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DonationsIncome;
