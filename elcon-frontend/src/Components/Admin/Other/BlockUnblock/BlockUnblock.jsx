import './BlockUnblock.css';
import { useEffect, useMemo, useState } from 'react';
import { getAllMembersList } from '../../../../api/membersService';

function BlockUnblock() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllMembersList()
      .then((response) => setRows(response.data || []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load members.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      [row.memberId, row.name, row.mobile, row.joinDate, row.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [rows, search]);

  return (
    <div>
      <h1 className="page-title">Block And Un Block Member Id</h1>

      <div className="panel">
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
                <th>Form Status</th>
                <th>Block Status</th>
                <th>Member ID</th>
                <th>Name</th>
                <th>Action</th>
                <th>Mobile</th>
                <th>Date Of Join</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}>Loading...</td></tr>
              ) : filteredRows.length === 0 ? (
                <tr><td colSpan={8}>No members found.</td></tr>
              ) : filteredRows.map((row, index) => (
                <tr key={row.memberId || index}>
                  <td>{index + 1}</td>
                  <td>{row.status || 'ACTIVE'}</td>
                  <td>{row.status || 'ACTIVE'}</td>
                  <td>{row.memberId}</td>
                  <td>{row.name}</td>
                  <td>
                    <button className="btn-success" type="button">BLOCK</button>
                  </td>
                  <td>{row.mobile}</td>
                  <td>{row.joinDate}</td>
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

export default BlockUnblock;
