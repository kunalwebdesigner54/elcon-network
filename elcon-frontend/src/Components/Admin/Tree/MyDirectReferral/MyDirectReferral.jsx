import './MyDirectReferral.css';
import { useEffect, useMemo, useState } from 'react';
import { getTeamTree } from '../../../../api/donationsService';

function flattenDirects(node) {
  return (node?.children || []).map((child, index) => ({
    sNo: index + 1,
    memberId: child.memberId,
    memberName: child.name,
    totalDirect: child.directCount || child.children?.length || 0,
    mobile: child.mobile || '---',
    joinDate: child.joinDate || '---',
    activeDate: child.joinDate || '---',
    formStatus: child.status || 'ACTIVE',
    blockStatus: child.status || 'ACTIVE',
  }));
}

function MyDirectReferral() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getTeamTree()
      .then((response) => setRows(flattenDirects(response.data)))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load direct referrals.'))
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div>
      <h1 className="page-title">Member Direct Report</h1>

      <div className="panel">
        <div className="form-grid" style={{ maxWidth: 700 }}>
          <label className="field-label">Member ID</label>
          <input className="text-input" />
        </div>

        <div className="btn-row">
          <button className="btn-primary" type="button">Show Details</button>
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
                <tr><td colSpan={9}>Loading...</td></tr>
              ) : filteredRows.length === 0 ? (
                <tr><td colSpan={9}>No direct referrals found.</td></tr>
              ) : filteredRows.map((row) => (
                <tr key={row.memberId}>
                  <td>{row.sNo}</td>
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

        <div className="table-footer">
          <span>Showing 1 to 10 of 366 entries</span>
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

export default MyDirectReferral;
