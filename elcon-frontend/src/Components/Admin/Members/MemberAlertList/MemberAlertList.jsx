import './MemberAlertList.css';
import { useEffect, useMemo, useState } from 'react';
import { getAllMembersList } from '../../../../api/membersService';

function MemberAlertList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllMembersList()
      .then((response) => setRows(response.data || []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load member alerts.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const source = rows.filter((row) => row.status !== 'ACTIVE');

    if (!query) {
      return source;
    }

    return source.filter((row) =>
      [row.memberId, row.name, row.mobile, row.city, row.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [rows, search]);

  return (
    <div>
      <h1 className="page-title">Member Alert List</h1>

      <div className="panel">
        <div className="form-grid">
          <label className="field-label">From Date</label>
          <input className="text-input" placeholder="DD-MM-YYYY" />

          <label className="field-label">To Date</label>
          <input className="text-input" placeholder="DD-MM-YYYY" />
        </div>

        <div className="btn-row">
          <button className="btn-primary" type="button">Submit</button>
        </div>
        <div className="btn-row">
          <button className="btn-outline" type="button">Excel</button>
        </div>

        <div className="table-tools">
          <div />
          <label className="search-box">
            Search:
            <input className="text-input" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
        </div>

        {error && <p style={{ color: '#c62828', padding: '0 16px 12px' }}>{error}</p>}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Form Status</th>
                <th>Block Status</th>
                <th>Member ID</th>
                <th>Member Name</th>
                <th>Total Direct</th>
                <th>Total Pay</th>
                <th>Timer</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}>Loading...</td></tr>
              ) : filteredRows.length === 0 ? (
                <tr><td colSpan={8}>No member alerts found.</td></tr>
              ) : filteredRows.map((row, index) => (
                <tr key={row.memberId || index}>
                  <td>{index + 1}</td>
                  <td>{row.status || 'INACTIVE'}</td>
                  <td>{row.status || 'INACTIVE'}</td>
                  <td>{row.memberId}</td>
                  <td>{row.name}</td>
                  <td>{row.wallet || '0.00'}</td>
                  <td>{row.joinDate}</td>
                  <td className="timer-error">Attention required</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Showing 1 to 10 of 21 entries</span>
          <div className="pagination">
                <button className="page-btn" onClick={() => handlePageChange(1)} disabled={page === 1}>&lt;&lt;</button>
                <button className="page-btn" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Prev</button>
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  let s = Math.max(1, page - 1);
                  let e = Math.min(totalPages, s + 2);
                  if (e - s < 2) s = Math.max(1, e - 2);
                  if (p < s || p > e) return null;
                  return (
                    <button 
                      key={p} 
                      className={`page-btn ${page === p ? 'active' : ''}`}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  );
                })}
                <button className="page-btn" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>Next</button>
                <button className="page-btn" onClick={() => handlePageChange(totalPages)} disabled={page === totalPages}>&gt;&gt;</button>
              </div>
        </div>
      </div>
    </div>
  );
}

export default MemberAlertList;
