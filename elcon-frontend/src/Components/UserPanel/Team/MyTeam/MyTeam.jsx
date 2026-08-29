import { formatDate } from '../../../../utils/dateFormatter';
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
      joinDate: child.joinDateRaw ? formatDate(child.joinDateRaw) : (child.joinDate || '---'),
      joinDateRaw: child.joinDateRaw,
      unlockLevel: child.upgradeLevel ?? 0,
      city: child.city || '---',
      directs: child.directCount || 0,
      status: child.status,
    });
    flattenDescendants(child, depth + 1, acc);
  });
  return acc;
}

function MyTeam() {
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filterMemberId, setFilterMemberId] = useState('');
  const [filterMemberName, setFilterMemberName] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterUnlock, setFilterUnlock] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
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
      if (appliedFilters.memberName && !row.name?.toLowerCase().includes(appliedFilters.memberName.toLowerCase())) return false;
      if (appliedFilters.level && String(row.level) !== appliedFilters.level) return false;
      if (appliedFilters.unlock && String(row.unlockLevel) !== appliedFilters.unlock) return false;
      if (appliedFilters.startDate && row.joinDateRaw) {
        if (new Date(row.joinDateRaw) < new Date(appliedFilters.startDate)) return false;
      }
      if (appliedFilters.endDate && row.joinDateRaw) {
        const endDate = new Date(appliedFilters.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (new Date(row.joinDateRaw) > endDate) return false;
      }
      return true;
    });
  }, [allRows, appliedFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = () => {
    setAppliedFilters({ 
      memberId: filterMemberId, 
      memberName: filterMemberName,
      level: filterLevel, 
      unlock: filterUnlock,
      startDate: filterStartDate,
      endDate: filterEndDate
    });
    setPage(1);
  };

  const maxLevel = useMemo(() => {
    return allRows.reduce((max, row) => Math.max(max, row.level || 1), 10);
  }, [allRows]);

  const levelOptions = [...Array(maxLevel)].map((_, i) => i + 1);

  return (
    <div>
      <h1 className="user-page-title">Downline List</h1>
      <div className="user-panel">
        <div className="downline-filters">
          <input type="text" placeholder="MEMBER ID" value={filterMemberId} onChange={(e) => setFilterMemberId(e.target.value)} />
          <input type="text" placeholder="MEMBER NAME" value={filterMemberName} onChange={(e) => setFilterMemberName(e.target.value)} />
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
            <option value="">LEVEL DEPTH</option>
            {levelOptions.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={filterUnlock} onChange={(e) => setFilterUnlock(e.target.value)}>
            <option value="">UPGRADE</option>
            {levelOptions.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <input type="date" placeholder="START DATE" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
          <input type="date" placeholder="END DATE" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
            <option value="10">10 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>
          <button className="user-btn-blue" type="button" onClick={handleSearch}>Search</button>
        </div>

        {loading && <p style={{ padding: '16px' }}>Loading…</p>}
        {error && <p style={{ color: 'red', padding: '16px' }}>{error}</p>}

        {!loading && !error && (
          <>
            <div className="table-toolbar">
              <div /> {/* flex spacer */}
              <div>
                <button className="user-btn-outline" type="button" style={{ marginRight: '8px' }}>Excel</button>
                <button className="user-btn-outline" type="button">PDF</button>
              </div>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>S.NO</th>
                    <th>MEMBER ID</th>
                    <th>MEMBER NAME</th>
                    <th>LEVEL DEPTH</th>
                    <th>JOIN DATE</th>
                    <th>UPGRADE</th>
                    <th>CITY</th>
                    <th>STATUS</th>
                    <th>DIRECTS</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No downline members found.</td></tr>
                  ) : (
                    pageRows.map((item, index) => (
                      <tr key={item.memberId}>
                        <td>{(page - 1) * pageSize + index + 1}</td>
                        <td>{item.memberId}</td>
                        <td>{item.name}</td>
                        <td>{item.level}</td>
                        <td>{item.joinDate}</td>
                        <td>{item.unlockLevel}</td>
                        <td>{item.city}</td>
                        <td>
                          <span style={{ color: item.status === 'ACTIVE' ? '#27ae60' : '#e74c3c', fontWeight: 600 }}>
                            {item.status}
                          </span>
                        </td>
                        <td>{item.directs}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer with Total and Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '0.95em', color: 'var(--text-muted)', fontWeight: '500', paddingLeft: '8px' }}>
                Total: {filteredRows.length} members
              </span>
              
              <div className="downline-pagination" style={{ margin: 0 }}>
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyTeam;
