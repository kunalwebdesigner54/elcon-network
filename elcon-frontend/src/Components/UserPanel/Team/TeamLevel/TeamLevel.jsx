import '../../Common/UserLayout.css';
import './TeamLevel.css';
import { useEffect, useState } from 'react';
import { getTeamTree } from '../../../../api/donationsService';

function countDescendants(node) {
  if (!node?.children || node.children.length === 0) {
    return 0;
  }

  return node.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0);
}

function TeamLevel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getTeamTree()
      .then((response) => {
        const directs = (response.data?.children || []).map((child, index) => ({
          sNo: index + 1,
          memberId: child.memberId,
          memberName: child.name,
          sponsorId: response.data?.memberId || '---',
          joinDate: child.joinDate || '---',
          status: child.status || 'ACTIVE',
          directs: child.directCount || child.children?.length || 0,
          totalTeam: countDescendants(child),
        }));
        setRows(directs);
      })
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load direct team members.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="user-page-title">My Tree Level</h1>
      <div className="user-panel">
        <div className="tree-controls">
          <label>LEVEL</label>
          <select><option>Select Level</option></select>
          <button className="user-btn-blue">Show Details</button>
        </div>
        <div className="table-toolbar"><button className="user-btn-outline">Excel</button></div>
        <div className="table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>MEMBERID</th>
                <th>NAME</th>
                <th>SPONSOR ID</th>
                <th>JOIN DATE</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={4}>{error}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={4}>No direct members found.</td></tr>
              ) : rows.map((item) => (
                <tr key={item.memberId}>
                  <td>{item.memberId}</td>
                  <td>{item.memberName}</td>
                  <td>{item.sponsorId}</td>
                  <td>{item.joinDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TeamLevel;
