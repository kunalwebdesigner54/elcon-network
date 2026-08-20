import React, { useState, useEffect } from "react";
import { getMyDonations, updateDonationStatus } from "../../../../api/donationsService";
import "./ReceivedHelp.css";

const ReceivedHelp = () => {
  const [receivedHelpRows, setReceivedHelpRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchReceivedDonations();
  }, []);

  const fetchReceivedDonations = async () => {
    try {
      setLoading(true);
      const data = await getMyDonations();
      const donations = data.data?.received || [];
      
      const received = donations.map((donation, index) => ({
        sNo: index + 1,
        donationId: donation.donationId,
        memberId: donation.fromMemberId || 'N/A',
        name: donation.fromName || 'N/A',
        amount: donation.amount || 0,
        level: donation.level || '-',
        requestDate: donation.date || '-',
        transactionId: donation.utrNumber || '---',
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

  const handleAction = async (donationId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this donation?`)) return;
    
    try {
      setActionLoading(donationId);
      await updateDonationStatus(donationId, status);
      await fetchReceivedDonations(); // Refresh list after action
    } catch (err) {
      alert(err?.response?.data?.message || `Failed to ${status} donation.`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'COMPLETED':
        return <span className="status-badge status-approved">APPROVED</span>;
      case 'WAITING_FOR_RECEIVER_CONFIRMATION':
        return <span className="status-badge status-waiting">WAITING</span>;
      case 'PENDING':
        return <span className="status-badge status-pending">PENDING</span>;
      case 'REJECTED':
        return <span className="status-badge status-rejected">REJECTED</span>;
      default:
        return <span className="status-badge status-locked">{status}</span>;
    }
  };

  return (
    <div>
      <h1 className="user-page-title">Received Help (Downline ➔ You)</h1>
      <div className="user-panel">
        {error && <div style={{ color: '#e74c3c', marginBottom: '14px' }}>{error}</div>}
        {loading && <div style={{ color: '#00aaff', marginBottom: '14px' }}>Loading donations...</div>}
        
        {!loading && (
          <>
            <div className="table-wrap custom-scrollbar" style={{ overflowX: 'auto' }}>
              <table className="data-table donation-progress-table">
                <thead>
                  <tr>
                    <th>S.NO</th>
                    <th>DONOR ID</th>
                    <th>DONOR NAME</th>
                    <th>LEVEL</th>
                    <th>AMOUNT</th>
                    <th>DONATION DATE</th>
                    <th>TRANSACTION NO</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {receivedHelpRows.length > 0 ? (
                    receivedHelpRows.map((row) => (
                      <tr key={row.donationId}>
                        <td>{row.sNo}</td>
                        <td>{row.memberId}</td>
                        <td>{row.name}</td>
                        <td>Level {row.level}</td>
                        <td>₹{row.amount?.toLocaleString('en-IN')}</td>
                        <td>{row.requestDate}</td>
                        <td>{row.transactionId}</td>
                        <td>{getStatusBadge(row.status)}</td>
                        <td>
                          {row.status === 'WAITING_FOR_RECEIVER_CONFIRMATION' ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className="user-mini-btn user-accept" 
                                type="button"
                                disabled={actionLoading === row.donationId}
                                onClick={() => handleAction(row.donationId, 'APPROVED')}
                                style={{ background: '#2ecc71', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                {actionLoading === row.donationId ? '...' : 'Approve'}
                              </button>
                              <button 
                                className="user-mini-btn user-reject" 
                                type="button"
                                disabled={actionLoading === row.donationId}
                                onClick={() => handleAction(row.donationId, 'REJECTED')}
                                style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                {actionLoading === row.donationId ? '...' : 'Reject'}
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: '#8b949e', fontSize: '12px' }}>No Action Required</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>No received donations found.</td>
                    </tr>
                  )}
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
