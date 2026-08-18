import './AdminRankHoldersList.css';
import { useEffect, useMemo, useState } from 'react';
import { getMemberPerformance } from '../../../api/membersService';

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
  const [selectedRankFilter, setSelectedRankFilter] = useState('');
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
    if (!selectedRankFilter) {
      return rows;
    }

    return rows.filter((holder) => String(holder.rank || '').toUpperCase() === selectedRankFilter);
  }, [rows, selectedRankFilter]);

  const handleSearchClick = () => {
    setSelectedRankFilter((prev) => prev);
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
                  <td>{row.totalTeamCount ?? row.directs ?? 0}</td>
                  <td>{row.unlockLevel || row.joiningLevel || '---'}</td>
                  <td>{typeof row.totalIncome === 'number' ? row.totalIncome : row.earning || '---'}</td>
                  <td>{row.rank}</td>
                  <td>{row.status || 'ACTIVE'}</td>
                  <td>
                    <div className="rank-action-buttons">
                      <button type="button" className="action-button action-button-show">
                        SHOW
                      </button>
                      <button type="button" className="action-button action-button-hide">
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
            <button className="page-btn">&lt;&lt;</button>
            <button className="page-btn">&lt;</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">&gt;</button>
            <button className="page-btn">&gt;&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRankHoldersList;
