import React, { useState, useEffect } from 'react';
import apiClient from '../../api/config';
import '../Admin/AwardsRewards/AwardsRewardsSetting.css'; // Reusing table styles

const RewardsQualifiers = () => {
  const [qualifiers, setQualifiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQualifiers = async () => {
      try {
        const res = await apiClient.get(`/rewards/qualifiers`, {
          withCredentials: true
        });
        if (res.data.success) {
          setQualifiers(res.data.qualifiers);
        }
      } catch (error) {
        console.error('Error fetching qualifiers', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQualifiers();
  }, []);

  return (
    <div className="awards-rewards-container">
      <div className="awards-rewards-card">
        <h2 className="awards-rewards-title" style={{ marginBottom: '24px' }}>REWARDS TARGET QUALIFIERS</h2>
        
        {loading ? (
          <p style={{ color: '#fff' }}>Loading...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="ar-table">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>MEMBER ID</th>
                  <th>NAME</th>
                  <th>CITY</th>
                  <th>QUALIFY DATE</th>
                  <th>REWARD</th>
                </tr>
              </thead>
              <tbody>
                {qualifiers.length > 0 ? (
                  qualifiers.map((q, index) => (
                    <tr key={index}>
                      <td>{q.sNo}</td>
                      <td>{q.memberId}</td>
                      <td>{q.name}</td>
                      <td>{q.city}</td>
                      <td>{new Date(q.qualifyDate).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                      <td>{q.reward}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No qualifiers found for the active contest.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsQualifiers;
