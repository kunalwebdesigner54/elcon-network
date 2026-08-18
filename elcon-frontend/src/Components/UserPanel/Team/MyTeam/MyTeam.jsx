import { useState, useEffect, useMemo } from 'react';
import '../../Common/UserLayout.css';
import './MyTeam.css';
import { getTeamTree } from '../../../../api/donationsService';

// Flatten a nested tree into an array with `level` (depth) metadata
function flattenDescendants(node, depth = 0, acc = []) {
  if (!node) return acc;
  (node.children || []).forEach((child) => {
    acc.push({
      memberId: child.memberId,
      name: child.name,
      level: depth + 1,
      joinDate: '---',
      unlockLevel: child.unlockLevel || 1,
      city: '---',
      rankNo: child.rank || '---',
      status: child.status,
    });
    flattenDescendants(child, depth + 1, acc);
  });
  return acc;
}

const PAGE_SIZE = 10;

function MyTeam() {
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const [filterMemberId, setFilterMemberId] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterUnlock, setFilterUnlock] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({});

  useEffect(() => {
    getTeamTree()
      .then((data) => {
        const flat = flattenDescendants(data.data);
        setAllRows(flat);
      })
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load downline list.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      if (appliedFilters.memberId && !row.memberId?.toLowerCase().includes(appliedFilters.memberId.toLowerCase())) return false;
      if (appliedFilters.level && String(row.level) !== appliedFilters.level) return false;
      if (appliedFilters.unlock && String(row.unlockLevel) !== appliedFilters.unlock) return false;
      return true;
    });
  }, [allRows, appliedFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = () => {
    setAppliedFilters({ memberId: filterMemberId, level: filterLevel, unlock: filterUnlock });
    setPage(1);
  };

  const levelOptions = [...Array(10)].map((_, i) => i + 1);

  return (
    <div>
      <h1 className="user-page-title">Downline List</h1>
      <div className="user-panel">
        <div className="downline-filters">
          <input type="text" placeholder="MEMBER ID" value={filterMemberId} onChange={(e) => setFilterMemberId(e.target.value)} />
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
            <option value="">LEVEL (Depth)</option>
            {levelOptions.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={filterUnlock} onChange={(e) => setFilterUnlock(e.target.value)}>
            <option value="">UNLOCK LEVEL</option>
            {levelOptions.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <button className="user-btn-blue" type="button" onClick={handleSearch}>Search</button>
        </div>

        {loading && <p style={{ padding: '16px' }}>Loading…</p>}
        {error && <p style={{ color: 'red', padding: '16px' }}>{error}</p>}

        {!loading && !error && (
          <>
            <div className="table-toolbar">
              <span style={{ fontSize: '0.9em', color: '#666' }}>Total: {filteredRows.length} members</span>
              <button className="user-btn-outline" type="button">Excel</button>
              <button className="user-btn-outline" type="button">PDF</button>
            </div>

            <div className="table-wrap">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>S.NO</th>
                    <th>MEMBER ID</th>
                    <th>MEMBER NAME</th>
                    <th>LEVEL (DEPTH)</th>
                    <th>UNLOCK LEVEL</th>
                    <th>STATUS</th>
                    <th>RANK</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No downline members found.</td></tr>
                  ) : (
                    pageRows.map((item, index) => (
                      <tr key={item.memberId}>
                        <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                        <td>{item.memberId}</td>
                        <td>{item.name}</td>
                        <td>{item.level}</td>
                        <td>{item.unlockLevel}</td>
                        <td>
                          <span style={{ color: item.status === 'ACTIVE' ? '#27ae60' : '#e74c3c', fontWeight: 600 }}>
                            {item.status}
                          </span>
                        </td>
                        <td>{item.rankNo}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="downline-pagination">
              <button className="downline-page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
              <button className="downline-page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
              {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    className={`downline-page-btn${page === p ? ' downline-page-btn-active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                );
              })}
              <button className="downline-page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
              <button className="downline-page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyTeam;
