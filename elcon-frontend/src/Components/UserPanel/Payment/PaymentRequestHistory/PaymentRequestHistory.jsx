import '../../Common/UserLayout.css';
import './PaymentRequestHistory.css';
import { useEffect, useMemo, useState } from 'react';
import { getMyDonations } from '../../../../api/donationsService';

function PaymentRequestHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getMyDonations()
      .then((response) => setRows(response.data?.sent || []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load payment request history.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      [row.fromMemberId, row.fromName, row.toMemberId, row.toName, row.donationId, row.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [rows, search]);

  return (
    <div>
      <h1 className="user-page-title">Payment Request History</h1>
      <div className="user-panel">
        <div className="table-toolbar"><button className="user-btn-outline" type="button">Excel</button></div>
        <input
          className="text-input"
          style={{ marginBottom: '12px', maxWidth: '320px' }}
          placeholder="Search payments"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {error && <p style={{ color: '#c62828', padding: '0 0 12px' }}>{error}</p>}
        <div className="table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>SR. NO.</th>
                <th>FROM MEMBER ID</th>
                <th>FROM MEMBER NAME</th>
                <th>TO MEMBER ID</th>
                <th>TO MEMBER NAME</th>
                <th>AMOUNT</th>
                <th>DONATION ID</th>
                <th>REQUEST DATE</th>
                <th>STATUS</th>
                <th>LEVEL</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10}>Loading...</td></tr>
              ) : filteredRows.length === 0 ? (
                <tr><td colSpan={10}>No payment requests found.</td></tr>
              ) : filteredRows.map((row, index) => (
                <tr key={row.donationId || `${row.fromMemberId}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{row.fromMemberId}</td>
                  <td>{row.fromName}</td>
                  <td>{row.toMemberId}</td>
                  <td>{row.toName}</td>
                  <td>{Number(row.amount || 0).toFixed(2)}</td>
                  <td>{row.donationId}</td>
                  <td>{row.date}</td>
                  <td>{row.status}</td>
                  <td>{row.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PaymentRequestHistory;
