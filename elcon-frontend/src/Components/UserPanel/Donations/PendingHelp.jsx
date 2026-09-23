import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./PendingHelp.css";
import { getExpectedPendingHelp, getMyDonations } from "../../../api/donationsService";

const PendingHelp = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingList, setPendingList] = useState([]);
  const [waitingDonations, setWaitingDonations] = useState([]);

  useEffect(() => {
    const fetchPendingHelp = async () => {
      try {
        setLoading(true);
        // Fetch both expected pending help and actual waiting donations
        const [expectedRes, donationsRes] = await Promise.allSettled([
          getExpectedPendingHelp(),
          getMyDonations()
        ]);

        if (expectedRes.status === 'fulfilled' && expectedRes.value.success) {
          setPendingList(expectedRes.value.data || []);
        } else {
          setError(expectedRes.value?.message || "Failed to load expected pending help.");
        }

        if (donationsRes.status === 'fulfilled') {
          const received = donationsRes.value?.data?.received || [];
          const waiting = received.filter(d => 
            d.status === 'WAITING_FOR_RECEIVER_CONFIRMATION' || d.status === 'PENDING'
          );
          setWaitingDonations(waiting);
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Error fetching pending help data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingHelp();
  }, []);

  const totalExpectedAmount = pendingList.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalWaitingAmount = waitingDonations.reduce((sum, item) => sum + (item.amount || 0), 0);
  const grandTotal = totalExpectedAmount + totalWaitingAmount;

  return (
    <div className="pending-help-container">
      <div className="pending-help-header">
        <h2>
          <i className="fas fa-clock"></i> Pending Help Details
        </h2>
        <p style={{ color: '#a0aec0', marginTop: '5px' }}>
          Total Pending Amount: <strong style={{ color: '#f39c12', fontSize: '1.1rem' }}>₹ {grandTotal.toLocaleString('en-IN')}</strong>
        </p>
      </div>

      {/* Actual Waiting Donations (Instant Milanewale) */}
      <div className="pending-help-table-card" style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#3498db', fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><i className="fas fa-exclamation-circle" style={{ color: '#e74c3c' }}></i> Action Required: Instant Receiving Donations</span>
          <Link to="/user/donations/recieved-help" className="user-btn-blue3" style={{ fontSize: '0.85rem', padding: '5px 10px' }}>
            Go to Received Help
          </Link>
        </h3>
        {loading ? (
          <div className="no-data">Loading waiting donations...</div>
        ) : waitingDonations.length > 0 ? (
          <div className="table-responsive">
            <table className="pending-help-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Sender ID</th>
                  <th>Sender Name</th>
                  <th>Level Upgrade</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {waitingDonations.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: 'bold', color: '#3498db' }}>{item.fromMemberId}</td>
                    <td>{item.fromName || '---'}</td>
                    <td>
                      <span className="level-badge">Level {item.level}</span>
                    </td>
                    <td>
                      <span className="amount-badge">₹ {item.amount?.toLocaleString('en-IN')}</span>
                    </td>
                    <td>{item.dateRaw ? new Date(item.dateRaw).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : (item.date || '---')}</td>
                    <td>
                      <span style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '0.85rem' }}>
                        Waiting For Approval
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data" style={{ padding: '20px' }}>
            <p>No instant receiving donations waiting for your approval.</p>
          </div>
        )}
      </div>

      {/* Expected Upgrades from Downline */}
      <div className="pending-help-table-card">
        <h3 style={{ margin: '0 0 15px 0', color: '#3498db', fontSize: '1.2rem' }}>Expected Help from Downline</h3>
        {loading ? (
          <div className="no-data">Loading expected pending help...</div>
        ) : error ? (
          <div className="no-data" style={{ color: '#e74c3c' }}>{error}</div>
        ) : pendingList.length > 0 ? (
          <div className="table-responsive">
            <table className="pending-help-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Member ID</th>
                  <th>Member Name</th>
                  <th>Level Pending</th>
                  <th>Expected Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: 'bold', color: '#3498db' }}>{item.memberId}</td>
                    <td>{item.name || '---'}</td>
                    <td>
                      <span className="level-badge">Level {item.level}</span>
                    </td>
                    <td>
                      <span className="amount-badge">₹ {item.amount?.toLocaleString('en-IN')}</span>
                    </td>
                    <td>
                      <span style={{ color: '#f39c12', fontWeight: 'bold', fontSize: '0.85rem' }}>
                        <i className="fas fa-hourglass-half"></i> Pending Upgrade
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">
            <i className="fas fa-check-circle" style={{ fontSize: '2rem', color: '#2ecc71', marginBottom: '10px' }}></i>
            <p>No expected pending help at the moment. All downline members are up to date!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingHelp;
