import React, { useState, useEffect } from "react";
import "./PendingHelp.css";
import { getExpectedPendingHelp } from "../../../api/donationsService";

const PendingHelp = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingList, setPendingList] = useState([]);

  useEffect(() => {
    const fetchPendingHelp = async () => {
      try {
        setLoading(true);
        const res = await getExpectedPendingHelp();
        if (res.success) {
          setPendingList(res.data || []);
        } else {
          setError(res.message || "Failed to load pending help.");
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

  return (
    <div className="pending-help-container">
      <div className="pending-help-header">
        <h2>
          <i className="fas fa-clock"></i> Pending Help Details
        </h2>
        <p style={{ color: '#a0aec0', marginTop: '5px' }}>
          Total Expected Pending Help: <strong style={{ color: '#f39c12', fontSize: '1.1rem' }}>₹ {totalExpectedAmount.toLocaleString('en-IN')}</strong>
        </p>
      </div>

      <div className="pending-help-table-card">
        {loading ? (
          <div className="no-data">Loading pending help data...</div>
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
            <p>No pending help at the moment. All downline members are up to date!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingHelp;
