import React from 'react';
import './AdminRankHoldersList.css';
import { useEffect, useMemo, useState } from 'react';
import { getMemberPerformance } from '../../../api/membersService';
import { toggleRankVisibility } from '../../../api/managementService';

const rankOptions = [
  'STARTER',
  'ACHIEVER',
  'STAR',
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'EMERALD',
  'DIAMOND',
  'CROWN DIAMOND'
];

function AdminRankHoldersList() {
  const totalPages = 1;

  const [page, setPage] = React.useState(1);

  const [selectedRankFilter, setSelectedRankFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMemberPerformance()
      .then((response) => setRows(Array.isArray(response.data) ? response.data : []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load rank holders.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredData = useMemo(() => {
    let data = rows;

    if (selectedRankFilter) {
      data = data.filter((holder) => String(holder.rank || '').toUpperCase() === selectedRankFilter);
    }

    if (appliedSearch) {
      const lowerQuery = appliedSearch.toLowerCase();
      data = data.filter((holder) => 
        String(holder.memberId || '').toLowerCase().includes(lowerQuery) ||
        String(holder.memberName || '').toLowerCase().includes(lowerQuery)
      );
    }

    return data;
  }, [rows, selectedRankFilter, appliedSearch]);

  const handleSearchClick = () => {
    setAppliedSearch(searchQuery);
  };

  const handleToggleVisibility = async (memberId, isVisible) => {
    if (!window.confirm(`Are you sure you want to ${isVisible ? 'SHOW' : 'HIDE'} rank for this user?`)) return;
    try {
      const res = await toggleRankVisibility({ memberId, isVisible });
      if (res.success) {
        setRows(prevRows => prevRows.map(row => 
          row.memberId === memberId ? { ...row, isRankVisible: isVisible } : row
        ));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update visibility');
    }
  };

  return (
    <div>
      <h1 className="page-title">Rank</h1>

      <div className="panel">
        
        <div className="rank-filter-grid">
          <select
            className="select-input"
            value={selectedRankFilter}
            onChange={(e) => setSelectedRankFilter(e.target.value)}
          >
            <option value="">All Ranks</option>
            {rankOptions.map((rank, idx) => (
              <option key={idx} value={rank}>
                {rank}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="text-input"
            placeholder="Search by ID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn-primary" onClick={handleSearchClick}>
            Search
          </button>
        </div>

        <div className="table-wrap">
          
          <table className="data-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>JOINING DATE</th>
                <th>MEMBER ID</th>
                <th>MEMBER NAME</th>
                <th>CITY</th>
                <th>DIRECTS</th>
                <th>UPGRADE</th>
                <th>EARNING</th>
                <th>RANK</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={11}>{error}</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={11}>No rank holders found.</td></tr>
              ) : filteredData.map((row, index) => (
                <tr key={row.memberId || index}>
                  <td>{row.sNo || index + 1}</td>
                  <td>{row.joinDate || row.joiningDate || '---'}</td>
                  <td>{row.memberId}</td>
                  <td>{row.memberName}</td>
                  <td>{row.city || '---'}</td>
                  <td>{row.directsCount ?? row.totalTeamCount ?? row.directs ?? 0}</td>
                  <td>{row.unlockLevel || row.joiningLevel || '---'}</td>
                  <td>{typeof row.totalIncome === 'number' ? row.totalIncome : row.earning || '---'}</td>
                  <td>{row.rank}</td>
                  <td>
                    <span className={row.isRankVisible ? 'status-active' : 'status-inactive'}>
                      {row.isRankVisible ? 'VISIBLE' : 'HIDDEN'}
                    </span>
                  </td>
                  <td>
                    <div className="rank-action-buttons">
                      <button 
                        type="button" 
                        className="action-button action-button-show"
                        onClick={() => handleToggleVisibility(row.memberId, true)}
                        disabled={row.isRankVisible}
                      >
                        SHOW
                      </button>
                      <button 
                        type="button" 
                        className="action-button action-button-hide"
                        onClick={() => handleToggleVisibility(row.memberId, false)}
                        disabled={!row.isRankVisible}
                      >
                        HIDE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            Showing Page 1 of {Math.ceil(filteredData.length / 10)} From{' '}
            {filteredData.length} Rows
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
      </div>
    </div>
  );
}

export default AdminRankHoldersList;
