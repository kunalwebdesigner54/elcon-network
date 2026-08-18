import { useState, useEffect } from 'react';
import '../../Common/UserLayout.css';
import './DirectList.css';
import { getTeamTree } from '../../../../api/donationsService';

function DirectList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getTeamTree()
      .then((data) => {
        // children of root = direct referrals
        const directs = (data.data?.children || []).map((child, index) => ({
          sNo: index + 1,
          memberId: child.memberId,
          memberName: child.name,
          city: '---',
          directs: child.directCount || 0,
          totalTeam: countDescendants(child),
          totalIncome: 0,
          status: child.status,
          unlockLevel: child.unlockLevel,
        }));
        setRows(directs);
      })
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load direct list.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="user-page-title">My Direct</h1>
      <div className="user-panel">
        {loading && <p style={{ padding: '16px' }}>Loading…</p>}
        {error && <p style={{ color: 'red', padding: '16px' }}>{error}</p>}

        {!loading && !error && (
          <>
            <div className="table-toolbar">
              <button className="user-btn-outline">Excel</button>
            </div>
            <div className="table-wrap">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>SR. NO.</th>
                    <th>MEMBER ID</th>
                    <th>MEMBER NAME</th>
                    <th>UNLOCK LEVEL</th>
                    <th>DIRECTS</th>
                    <th>TOTAL TEAM</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No direct referrals yet.</td></tr>
                  ) : (
                    rows.map((item) => (
                      <tr key={item.memberId}>
                        <td>{item.sNo}</td>
                        <td>{item.memberId}</td>
                        <td>{item.memberName}</td>
                        <td>{item.unlockLevel}</td>
                        <td>{item.directs}</td>
                        <td>{item.totalTeam}</td>
                        <td>
                          <span style={{ color: item.status === 'ACTIVE' ? '#27ae60' : '#e74c3c', fontWeight: 600 }}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Count all descendants recursively
function countDescendants(node) {
  if (!node.children || node.children.length === 0) return 0;
  return node.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0);
}

export default DirectList;
