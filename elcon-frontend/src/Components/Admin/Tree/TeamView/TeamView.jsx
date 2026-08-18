import './TeamView.css';
import { useEffect, useMemo, useState } from 'react';
import { getTeamTree } from '../../../../api/donationsService';

function flattenTree(node, parentId = '', depth = 0, acc = []) {
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
            <button className="page-btn">Previous</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">4</button>
            <button className="page-btn">5</button>
            <button className="page-btn">...</button>
            <button className="page-btn">37</button>
            <button className="page-btn">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamView;
