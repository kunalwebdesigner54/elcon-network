import React from 'react';
import './UserMyRank.css';
import { useEffect, useMemo, useState } from 'react';
import { getRankHolders } from '../../../api/membersService';
import { getUserDashboard } from '../../../api/dashboardService';

const rankProgressionData = [
  { earning: 300, name: 'STARTER', targetEarning: 3000, upgradeAmount: 300, directs: 10 },
  { earning: 1000, name: 'ACHIEVER', targetEarning: 25000, upgradeAmount: 1000, directs: 10 },
  { earning: 2000, name: 'STAR', targetEarning: 50000, upgradeAmount: 2000, directs: 10 },
  { earning: 4000, name: 'BRONZE', targetEarning: 100000, upgradeAmount: 4000, directs: 10 },
  { earning: 8000, name: 'SILVER', targetEarning: 500000, upgradeAmount: 8000, directs: 10 },
  { earning: 16000, name: 'GOLD', targetEarning: 1000000, upgradeAmount: 16000, directs: 10 },
  { earning: 32000, name: 'PLATINUM', targetEarning: 2500000, upgradeAmount: 32000, directs: 10 },
  { earning: 64000, name: 'EMERALD', targetEarning: 5000000, upgradeAmount: 64000, directs: 10 },
  { earning: 128000, name: 'DIAMOND', targetEarning: 10000000, upgradeAmount: 128000, directs: 10 },
  { earning: 256000, name: 'CROWN DIAMOND', targetEarning: 50000000, upgradeAmount: 256000, directs: 10 },
];

const rankOptions = rankProgressionData.map((rank) => rank.name);

function UserMyRank() {
  const totalPages = 1;

  const [page, setPage] = React.useState(1);

  const [expandedRank, setExpandedRank] = useState(5);
  const [selectedRankFilter, setSelectedRankFilter] = useState('');
  const [rankRows, setRankRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentRankName, setCurrentRankName] = useState('---');
  const [isRankVisible, setIsRankVisible] = useState(true);
  const [currentEarning, setCurrentEarning] = useState(0);

  useEffect(() => {
    // Use allSettled so a rank-holders failure doesn't wipe out dashboard data
    Promise.allSettled([getUserDashboard(), getRankHolders()])
      .then(([dashboardResult, rankHoldersResult]) => {
        if (dashboardResult.status === 'fulfilled') {
          const dash = dashboardResult.value?.data || {};
          setCurrentRankName(dash.rank || '---');
          setIsRankVisible(dash.isRankVisible !== false);
          const totalEarning = String(dash.totalEarning || '0').replace(/[^0-9.]/g, '');
          setCurrentEarning(Number(totalEarning) || 0);
        }

        if (rankHoldersResult.status === 'fulfilled') {
          const rankList = rankHoldersResult.value?.data || [];
          setRankRows(Array.isArray(rankList) ? rankList : []);
        } else {
          setError(
            rankHoldersResult.reason?.response?.data?.message || 'Failed to load rank holders.'
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredData = useMemo(() => {
    if (!selectedRankFilter) {
      return rankRows;
    }

    return rankRows.filter((holder) => String(holder.rank || '').toUpperCase() === selectedRankFilter);
  }, [rankRows, selectedRankFilter]);

  const currentRankIndex = Math.max(0, rankProgressionData.findIndex((rank) => rank.name === currentRankName));
  const currentRank = rankProgressionData[currentRankIndex] || rankProgressionData[0];
  const nextRank = rankProgressionData[Math.min(currentRankIndex + 1, rankProgressionData.length - 1)] || currentRank;

  const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

  const getTargetForRank = (rankName) => {
    const found = rankProgressionData.find((r) => r.name === rankName);
    return found ? found.targetEarning : rankProgressionData[0].targetEarning;
  };

  const toggleRank = (rankIndex) => {
    setExpandedRank(expandedRank === rankIndex ? null : rankIndex);
  };

  const handleSearchClick = () => {
    setSelectedRankFilter((prev) => prev);
  };

  const progressPercentage = currentRank.targetEarning > 0 ? (currentEarning / currentRank.targetEarning) * 100 : 0;
  const nextProgressPercentage = nextRank.targetEarning > 0 ? (currentEarning / nextRank.targetEarning) * 100 : 0;

  return (
    <div>
      <h1 className="user-page-title">My Rank</h1>
      <div className="user-rank-container">
      

      <div className="user-rank-panel">
        {/* Left Section - Rank Progression */}
        <div className="user-rank-progression-section">
          <h2 className="user-rank-section-title">RANK PROGRESSION</h2>
          <div className="user-rank-progression-list">
            {rankProgressionData.map((rank, index) => (
              <div
                key={index}
                className={`user-rank-item ${expandedRank === index ? 'expanded' : ''}`}
                style={{
                  border: expandedRank === index ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  background: expandedRank === index ? 'rgba(0, 242, 254, 0.05)' : 'transparent',
                  overflow: 'hidden'
                }}
              >
                <div 
                  className="user-rank-item-header" 
                  onClick={() => toggleRank(index)}
                  style={{ 
                    cursor: 'pointer', 
                    padding: '12px 15px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="user-rank-circle" style={{
                      width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gradient-primary)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', marginRight: '15px'
                    }}>
                      {index + 1}
                    </div>
                     <div className="user-rank-info" style={{ display: 'flex', flexDirection: 'column' }}>
                       <span className="user-rank-item-earning" style={{ fontSize: '12px', color: '#00f2fe' }}>Target: {formatCurrency(rank.targetEarning)}</span>
                       <span className="user-rank-item-name" style={{ display: 'none' }}>{rank.name}</span>
                     </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#00f2fe', fontSize: '12px' }}>
                    <span className="user-rank-item-name-right" style={{ 
                      fontWeight: 'bold', 
                      fontSize: '14px', 
                      marginRight: '10px', 
                      textTransform: 'uppercase',
                      color: rank.name === 'STARTER' ? '#b0c4de' :
                             rank.name === 'ACHIEVER' ? '#87ceeb' :
                             rank.name === 'STAR' ? '#f1c40f' :
                             rank.name === 'BRONZE' ? '#cd7f32' :
                             rank.name === 'SILVER' ? '#c0c0c0' :
                             rank.name === 'GOLD' ? '#ffd700' :
                             rank.name === 'PLATINUM' ? '#e5e4e2' :
                             rank.name === 'EMERALD' ? '#50c878' :
                             rank.name === 'DIAMOND' ? '#00e5ff' :
                             rank.name === 'CROWN DIAMOND' ? '#d8a0f0' : '#ffffff',
                      textShadow: '0 0 5px rgba(0,0,0,0.5)'
                    }}>{rank.name}</span>
                    {expandedRank === index ? '▼' : '▶'}
                  </div>
                </div>

                {expandedRank === index && (
                  <div className="user-rank-item-body" style={{ padding: '0 15px 15px 62px', color: '#a0aec0', fontSize: '13px', lineHeight: '1.5' }}>
                    <p style={{ margin: '0 0 5px 0' }}>Target Earning: {formatCurrency(rank.targetEarning)}</p>
                    <p style={{ margin: 0 }}>
                      Achieve this prestigious rank with {rank.directs} Active Directs and {formatCurrency(rank.upgradeAmount)} id upgrade donation contribution.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Section - Current and Next Rank */}
        <div className="user-rank-status-section">
          <div className="user-rank-current-card">
            <h3 className="user-rank-card-title">CURRENT RANK</h3>
            <div className="user-rank-badge">
              {!isRankVisible ? 'HIDDEN' : currentRank.name}
            </div>
            {!isRankVisible && (
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                Your rank visibility is currently hidden by the administrator.
              </p>
            )}
            <div className="user-rank-earning-display">
              <span className="user-rank-target-label">Current Earning</span>
              <span className="user-rank-target-amount">₹{currentEarning.toLocaleString('en-IN')}</span>
            </div>
            <div className="user-rank-target-display">
              <span className="user-rank-target-label">Target Amount</span>
              <span className="user-rank-target-amount">₹{currentRank.targetEarning.toLocaleString('en-IN')}</span>
            </div>
            <div className="user-rank-progress-bar">
              <div
                className="user-rank-progress-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="user-rank-progress-text">
              {currentEarning} / {currentRank.targetEarning}
            </div>
          </div>

          <div className="user-rank-next-card">
            <h3 className="user-rank-card-title">TARGET INCOME</h3>
            <div className="user-rank-next-badge">
              {nextRank.name}
            </div>
            <div className="user-rank-next-earning-display">
              <span className="user-rank-target-label">Target Income</span>
              <span className="user-rank-target-amount">₹{nextRank.targetEarning.toLocaleString('en-IN')}</span>
            </div>
            <div className="user-rank-progress-bar">
              <div
                className="user-rank-next-progress-fill"
                style={{ width: `${Math.min(nextProgressPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="user-rank-progress-text">
              {currentEarning} / {nextRank.targetEarning}
            </div>
          </div>
        </div>
      </div>

      {/* Rank Holders List */}
      <div className="user-rank-holders-panel">
        <div className="user-rank-holders-header">
          <h2 className="user-rank-holders-title">RANK HOLDERS LIST</h2>
        </div>

        <div className="user-rank-filter-grid">
          <select
            className="user-rank-select"
            value={selectedRankFilter}
            onChange={(e) => setSelectedRankFilter(e.target.value)}
          >
            <option value="">All Ranks</option>
            {rankOptions.map((rank, index) => (
              <option key={index} value={rank}>
                {rank}
              </option>
            ))}
          </select>
          <button type="button" className="btn-primary w-100" style={{ height: '100%', minHeight: '44px' }} onClick={handleSearchClick}>
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
                <th>TARGET</th>
                <th>RANK</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={10}>{error}</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={10}>No rank holders found.</td></tr>
              ) : filteredData.map((row, index) => (
                <tr key={row.memberId || index}>
                  <td>{row.sNo || index + 1}</td>
                  <td>{row.joinDate || row.joiningDate || '---'}</td>
                  <td>{row.memberId}</td>
                  <td>{row.memberName}</td>
                  <td>{row.city || '---'}</td>
                  <td>{row.directsCount ?? row.totalTeamCount ?? 0}</td>
                  <td>{row.unlockLevel || row.joiningLevel || '---'}</td>
                  <td>{typeof row.totalIncome === 'number' ? row.totalIncome : row.earning || '---'}</td>
                  <td>{formatCurrency(getTargetForRank(row.rank))}</td>
                  <td>{row.rank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Showing Page 1 of 1 From {filteredData.length} Rows</span>
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
  
    </div>
  );
}

export default UserMyRank;
