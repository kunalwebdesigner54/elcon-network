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
    .filter((r) => r.status === 'COMPLETED')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const handleSearch = () => {
    setAppliedFilters({ memberId: filterMemberId, level: filterLevel, from: filterFrom, to: filterTo });
  };

  return (
    <div>
      <h1 className="user-page-title">Donations Income</h1>
      <div className="user-panel">
        <h3>Total Donations Income : ₹ {totalDonationIncome.toLocaleString('en-IN')}</h3>

        <div className="donation-income-filters">
          <input
            className="text-input" type="text" placeholder="DONOR MEMBER ID"
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
          <button className="user-btn-blue" type="button" onClick={handleSearch}>Search</button>
        </div>

        <div className="table-toolbar">
          <button className="user-btn-outline" type="button">Excel</button>
          <button className="user-btn-outline" type="button">PDF</button>
        </div>

        {loading && <p style={{ padding: '16px' }}>Loading…</p>}
        {error && <p style={{ color: 'red', padding: '16px' }}>{error}</p>}

        {!loading && !error && (
          <div className="table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>DONOR MEMBER ID</th>
                  <th>DONOR MEMBER NAME</th>
                  <th>LEVEL</th>
                  <th>AMOUNT (₹)</th>
                  <th>DONATION ID</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>No donation income records found.</td></tr>
                ) : (
                  filteredRows.map((row, index) => (
                    <tr key={row.donationId || index}>
                      <td>{index + 1}</td>
                      <td>{row.fromMemberId}</td>
                      <td>{row.fromName}</td>
                      <td>{row.level}</td>
                      <td>₹ {row.amount?.toLocaleString('en-IN')}</td>
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
        )}
      </div>
    </div>
  );
}

export default DonationsIncome;
