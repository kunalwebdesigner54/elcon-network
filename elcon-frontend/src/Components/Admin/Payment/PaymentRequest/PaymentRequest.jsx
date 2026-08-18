import './PaymentRequest.css';
import { useEffect, useMemo, useState } from 'react';
import { getAllDonations } from '../../../../api/donationsService';

function PaymentRequest() {
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
            <button className="page-btn">Previous</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">4</button>
            <button className="page-btn">5</button>
            <button className="page-btn">...</button>
            <button className="page-btn">144</button>
            <button className="page-btn">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentRequest;
