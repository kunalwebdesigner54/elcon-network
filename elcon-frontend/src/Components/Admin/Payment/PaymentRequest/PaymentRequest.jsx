import React from 'react';
import './PaymentRequest.css';
import { useEffect, useMemo, useState } from 'react';
import { getAllDonations } from '../../../../api/donationsService';

function PaymentRequest() {
  const [page, setPage] = React.useState(1);
  const handlePageChange = (p) => setPage(p);
  const totalPages = 1;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllDonations({ status: 'PENDING' })
      .then((response) => setRows(response.data || []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load payment requests.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      [row.donationId, row.fromMemberId, row.fromName, row.toMemberId, row.toName, row.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [rows, search]);

  return (
    <div>
      <h1 className="page-title">Payment Request</h1>

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
                <th>From Member ID</th>
                <th>From Member Name</th>
                <th>To Member ID</th>
                <th>To Member Name</th>
                <th>Amount</th>
                <th>Donation ID</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>Level</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11}>Loading...</td></tr>
              ) : filteredRows.length === 0 ? (
                <tr><td colSpan={11}>No payment requests found.</td></tr>
              ) : filteredRows.map((row) => (
                <tr key={row.donationId}>
                  <td>{row.sNo}</td>
                  <td>{row.fromMemberId}</td>
                  <td>{row.fromName}</td>
                  <td>{row.toMemberId}</td>
                  <td>{row.toName}</td>
                  <td>{Number(row.amount || 0).toFixed(2)}</td>
                  <td>{row.donationId}</td>
                  <td>{row.date}</td>
                  <td>{row.status}</td>
                  <td>{row.level}</td>
                  <td>
                    <button className="btn-danger" type="button">Decline</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Showing 1 to {filteredRows.length} of {filteredRows.length} entries</span>
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

export default PaymentRequest;
