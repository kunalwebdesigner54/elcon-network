import './MyDirectReferral.css';
import { useEffect, useMemo, useState } from 'react';
import { getTeamTree } from '../../../../api/donationsService';

function flattenDirects(node, showAllDescendants = false) {
  const acc = [];
  
  const traverse = (n) => {
    if (!n) return;
    (n.children || []).forEach((child) => {
      acc.push({
        memberId: child.memberId,
        memberName: child.name,
        totalDirect: child.directCount || child.children?.length || 0,
        mobile: child.mobile || '---',
        joinDate: child.joinDate || '---',
        activeDate: child.joinDate || '---',
        formStatus: child.status || 'ACTIVE',
        blockStatus: child.status || 'ACTIVE',
      });
      if (showAllDescendants) {
        traverse(child);
      }
    });
  };

  traverse(node);
  
  return acc.map((item, index) => ({ ...item, sNo: index + 1 }));
}

function MyDirectReferral() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [targetMemberId, setTargetMemberId] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchDirects = (memberIdToFetch = '') => {
    setLoading(true);
    getTeamTree(memberIdToFetch)
      .then((response) => setRows(flattenDirects(response.data, memberIdToFetch === '')))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load direct referrals.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDirects('');
  }, []);

  const handleShowDetails = () => {
    fetchDirects(targetMemberId);
  };

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
          <input 
            className="text-input" 
            style={{ maxWidth: '140px' }} 
            placeholder="MEMBER ID" 
            value={targetMemberId}
            onChange={(e) => setTargetMemberId(e.target.value)}
          />
          <button className="btn-primary" type="button" onClick={handleShowDetails}>SHOW DETAILS</button>
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
        )}
      </div>
    </div>
  );
}

export default MyDirectReferral;
