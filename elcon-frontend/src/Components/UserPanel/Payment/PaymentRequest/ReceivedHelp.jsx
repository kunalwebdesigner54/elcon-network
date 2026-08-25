import React, { useState, useEffect } from "react";
import { getMyDonations, updateDonationStatus } from "../../../../api/donationsService";
import "./ReceivedHelp.css";

const ReceivedHelp = () => {
  const [receivedHelpRows, setReceivedHelpRows] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReceivedDonations();
  }, []);

  const fetchReceivedDonations = async () => {
    try {
      setLoading(true);
      const data = await getMyDonations();
      // Backend returns: { success, data: { sent: [...], received: [...], summary: {...} } }
      const receivedDonations = data?.data?.received || [];

      const received = receivedDonations.map((donation, index) => ({
        sNo: index + 1,
        memberId: donation.fromMemberId || 'N/A',
        name: donation.fromName || 'N/A',
        amount: donation.amount || 0,
        rank: donation.level || '-',
        requestDate: donation.dateRaw ? new Date(donation.dateRaw).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : (donation.date || '-'),
        transactionId: donation.donationId || '-',
        utrNumber: donation.utrNumber || '---',
        status: donation.status || 'PENDING'
      }));

      setReceivedHelpRows(received);
      setError('');
    } catch (err) {
      setError('Failed to load received donations');
      console.error('ReceivedHelp fetch error:', err);
      setReceivedHelpRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (donationId, status) => {
    if (!window.confirm(`Are you sure you want to mark this donation as ${status}?`)) return;
    try {
      setLoading(true);
      await updateDonationStatus(donationId, status);
      await fetchReceivedDonations();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update status');
      setLoading(false);
    }
  };
  const visibleRows = receivedHelpRows.filter(row => activeTab === 'ALL' || row.status === activeTab);

  return (
    <div>
      <h1 className="user-page-title">Received Help (Downline ➔ You)</h1>
      <div className="donation-tabs">
        {[
          { key: 'WAITING_FOR_RECEIVER_CONFIRMATION', label: 'WAITING' },
          { key: 'APPROVED', label: 'APPROVED' },
          { key: 'PENDING', label: 'PENDING' },
          { key: 'REJECTED', label: 'REJECTED' },
          { key: 'ALL', label: 'ALL HISTORY' }
        ].map(tab => (
          <button 
            key={tab.key}
            className={`donation-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
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
                <option value="">UPGRADE LEVEL</option>
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
              <table className="data-table">
                <thead>
                  <tr>
                    <th>S.NO</th>
                    <th>DONAR MEMBER ID</th>
                    <th>DONAR MEMBER NAME</th>
                    <th>AMOUNT</th>
                    <th>UPGRADE LEVEL</th>
                    <th>REQUEST DATE</th>
                    <th>TRASACTION ID</th>
                    <th>UTR NUMBER</th>
                    <th>ACTION</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.sNo}>
                  <td>{row.sNo}</td>
                  <td>{row.memberId}</td>
                  <td>{row.name}</td>
                  <td>{row.amount}</td>
                  <td>{row.rank}</td>
                  <td>{row.requestDate}</td>
                  <td>{row.transactionId}</td>
                  <td>{row.utrNumber}</td>
                  <td>
                    {['WAITING_FOR_RECEIVER_CONFIRMATION', 'PENDING'].includes(row.status) ? (
                      <>
                        <button className="user-mini-btn user-accept" type="button" onClick={() => handleUpdateStatus(row.transactionId, 'APPROVED')}>ACCEPT</button>
                        <button className="user-mini-btn user-reject" type="button" style={{ marginLeft: 4 }} onClick={() => handleUpdateStatus(row.transactionId, 'REJECTED')}>REJECT</button>
                      </>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td style={{
                    color: ['APPROVED', 'COMPLETED'].includes(row.status) ? '#27ae60' : row.status === 'REJECTED' ? '#e74c3c' : '#f39c12',
                    fontWeight: 500
                  }}>
                    {row.status.replace(/_/g, ' ')}
                  </td>
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
