import React from 'react';
import './TeamView.css';
import { useEffect, useMemo, useState } from 'react';
import { getTeamTree } from '../../../../api/donationsService';

function flattenTree(node, parentId = '', depth = 0, acc = []) {
  const [page, setPage] = React.useState(1);
  const handlePageChange = (p) => setPage(p);
  const totalPages = 1;

  if (!node) {
    return acc;
  }

  (node.children || []).forEach((child) => {
    acc.push({
      memberId: child.memberId,
      memberName: child.name,
      totalDirect: child.directCount || child.children?.length || 0,
      mobile: child.mobile || '---',
      sponsorId: node.memberId,
      sponsorName: node.name,
      joinDate: child.joinDate || '---',
      activeDate: child.joinDate || '---',
      formStatus: child.status || 'ACTIVE',
      blockStatus: child.status || 'ACTIVE',
      depth,
    });
    flattenTree(child, child.memberId, depth + 1, acc);
  });

  return acc;
}

function TeamView() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getTeamTree()
      .then((response) => setRows(flattenTree(response.data)))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load team members.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      [row.memberId, row.memberName, row.mobile, row.sponsorId, row.sponsorName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [rows, search]);

  return (
    <div>
      <h1 className="page-title">My Team</h1>

      <div className="panel">
        <div className="form-grid-wide" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <div className="form-grid" style={{ gridTemplateColumns: '150px 1fr', maxWidth: '100%' }}>
              <label className="field-label">From Date</label>
              <input className="text-input" placeholder="DD-MM-YYYY" />

              <label className="field-label">To Date</label>
              <input className="text-input" placeholder="DD-MM-YYYY" />
            </div>
            <div className="btn-row">
              <button className="btn-primary">Submit</button>
            </div>
          </div>

          <div>
            <div className="form-grid" style={{ gridTemplateColumns: '130px 1fr', maxWidth: '100%' }}>
              <label className="field-label">Member ID</label>
              <input className="text-input" />
            </div>
            <div className="btn-row">
              <button className="btn-primary">Show Details</button>
            </div>
          </div>
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
                <th>MemberID</th>
                <th>Name</th>
                <th>Total Direct</th>
                <th>Mobile</th>
                <th>Sponsor ID</th>
                <th>Sponsor Name</th>
                <th>Join Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}>Loading...</td></tr>
              ) : filteredRows.length === 0 ? (
                <tr><td colSpan={8}>No team members found.</td></tr>
              ) : filteredRows.map((row, index) => (
                <tr key={row.memberId || index}>
                  <td>{index + 1}</td>
                  <td>{row.memberId}</td>
                  <td>{row.memberName}</td>
                  <td>{row.totalDirect}</td>
                  <td>{row.mobile}</td>
                  <td>{row.sponsorId}</td>
                  <td>{row.sponsorName}</td>
                  <td>{row.joinDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Showing 1 to 10 of 365 entries</span>
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

export default TeamView;
