import React, { useState, useEffect } from "react";
import { getMyDonations } from "../../../../api/donationsService";
import "./ReceivedHelp.css";

const ReceivedHelp = () => {
  const [receivedHelpRows, setReceivedHelpRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReceivedDonations();
  }, []);

  const fetchReceivedDonations = async () => {
    try {
      setLoading(true);
      const data = await getMyDonations();
      const donations = Array.isArray(data) ? data : (data.data ? data.data : []);
      
      // Filter for received donations (where logged-in user is the receiver)
      const received = donations
        .filter(d => d.received) // Assuming received is a property
        .map((donation, index) => ({
          sNo: index + 1,
          memberId: donation.from?.memberId || 'N/A',
          name: donation.from?.userName || 'N/A',
          amount: donation.amount || 0,
          rank: donation.level || '-',
          requestDate: donation.createdAt ? new Date(donation.createdAt).toLocaleString('en-IN') : '-',
          transactionId: donation._id || '-',
          status: donation.status || 'PENDING'
        }));

      setReceivedHelpRows(received);
      setError('');
    } catch (err) {
      setError('Failed to load received donations');
      console.error(err);
      setReceivedHelpRows([]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <h1 className="user-page-title">Received  Help (Downline ➔ You)</h1>
      <div className="user-panel">
        {error && <div style={{ color: '#e74c3c', marginBottom: '14px' }}>{error}</div>}
        {loading && <div style={{ color: '#666', marginBottom: '14px' }}>Loading...</div>}
        
        {!loading && (
          <>
            <div
              className="level-income-filters"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, minmax(110px, 1fr))",
                gap: 8,
                marginBottom: 14,
                ...(window.innerWidth <= 600
                  ? { gridTemplateColumns: "1fr", gap: 6 }
                  : {})
              }}
            >
              <input className="text-input" placeholder="DONAR MEMBER ID" />
              <select className="select-input">
                <option value="">RANK</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
              <label className="filter-field">
                <input className="text-input" type="date" aria-label="Start Date" />
              </label>
              <label className="filter-field">
                <input className="text-input" type="date" aria-label="End Date" />
              </label>
              <select className="select-input">
                <option value="10">10</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <button className="user-btn-blue3" type="button">Search</button>
            </div>
            <div className="epin-tools" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 10 }}>
              <button className="btn-outline">Excel</button>
              <button className="btn-outline">PDF</button>
              <button className="btn-outline">Print</button>
            </div>
            <div className="table-wrap">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>S.NO</th>
                    <th>DONAR MEMBER ID</th>
                    <th>DONAR MEMBER NAME</th>
                    <th>AMOUNT</th>
                    <th>RANK</th>
                    <th>REQUEST DATE</th>
                    <th>TRASACTION ID</th>
                    <th>PAYMENT PROOF</th>
                    <th>ACTION</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {receivedHelpRows.map((row) => (
                <tr key={row.sNo}>
                  <td>{row.sNo}</td>
                  <td>{row.memberId}</td>
                  <td>{row.name}</td>
                  <td>{row.amount}</td>
                  <td>{row.rank}</td>
                  <td>{row.requestDate}</td>
                  <td>{row.transactionId}</td>
                  <td><button className="user-btn-blue3">VIEW</button></td>
                  <td>
                    <button className="user-mini-btn user-accept" type="button">ACCEPT</button>
                    <button className="user-mini-btn user-reject" type="button" style={{ marginLeft: 4 }}>REJECT</button>
                  </td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReceivedHelp;
