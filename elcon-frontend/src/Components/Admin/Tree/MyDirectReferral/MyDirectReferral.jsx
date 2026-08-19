import './MyDirectReferral.css';
import { useEffect, useMemo, useState } from 'react';
import { getTeamTree } from '../../../../api/donationsService';

function flattenDirects(node) {
  return (node?.children || []).map((child, index) => ({
    sNo: index + 1,
    memberId: child.memberId,
    memberName: child.name,
    totalDirect: child.directCount || child.children?.length || 0,
    mobile: child.mobile || '---',
    joinDate: child.joinDate || '---',
    activeDate: child.joinDate || '---',
    formStatus: child.status || 'ACTIVE',
    blockStatus: child.status || 'ACTIVE',
  }));
}

function MyDirectReferral() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    getTeamTree()
      .then((response) => setRows(flattenDirects(response.data)))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load direct referrals.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      [row.memberId, row.memberName, row.mobile, row.joinDate]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  // Reset to first page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div>
      <h1 className="page-title" style={{ fontSize: '42px', marginBottom: '14px' }}>Member Direct Report</h1>

      <div className="panel" style={{ borderRadius: '28px', padding: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          <input className="text-input" style={{ maxWidth: '140px' }} placeholder="MEMBER ID" />
          <button className="btn-primary" type="button">SHOW DETAILS</button>
          <button className="btn-outline" type="button">EXCEL</button>
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
                <th>Member ID</th>
                <th>Member Name</th>
                <th>Total Direct</th>
                <th>Mobile</th>
                <th>Joining Date</th>
                <th>Active Date</th>
                <th>Form Status</th>
                <th>Block Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
              ) : pageRows.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>No direct referrals found.</td></tr>
              ) : pageRows.map((row, index) => (
                <tr key={row.memberId}>
                  <td>{(page - 1) * pageSize + index + 1}</td>
                  <td>{row.memberId}</td>
                  <td>{row.memberName}</td>
                  <td>{row.totalDirect}</td>
                  <td>{row.mobile}</td>
                  <td>{row.joinDate}</td>
                  <td>{row.activeDate}</td>
                  <td>{row.formStatus}</td>
                  <td>{row.blockStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredRows.length > 0 && (
          <div className="table-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <span>
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredRows.length)} of {filteredRows.length} entries
            </span>
            <div className="pagination" style={{ display: 'flex', gap: '4px' }}>
              <button 
                className="page-btn" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let p = page > 3 && totalPages > 5 ? page - 2 + i : i + 1;
                if (p > totalPages) p = totalPages - (4 - i); // adjust if at end
                if (p < 1) p = 1;
                
                return (
                  <button
                    key={p}
                    className={`page-btn ${page === p ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                );
              })}
              
              <button 
                className="page-btn" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyDirectReferral;
