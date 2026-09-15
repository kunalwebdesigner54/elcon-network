import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Admin/AwardsRewards/AwardsRewardsSetting.css'; // Reusing table styles

const LuckyDrawWinners = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/luckydraw/winners`, {
          withCredentials: true
        });
        if (res.data.success) {
          setWinners(res.data.winners);
        }
      } catch (error) {
        console.error('Error fetching winners', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWinners();
  }, []);

  return (
    <div className="awards-rewards-container">
      <div className="awards-rewards-card">
        <h2 className="awards-rewards-title" style={{ marginBottom: '24px' }}>LUCK DROW WINNER LIST</h2>
        
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
                  <th>DATE</th>
                  <th>REWARD NAME</th>
                  <th>REWARD IMAGE</th>
                </tr>
              </thead>
              <tbody>
                {winners.length > 0 ? (
                  winners.map((w, index) => (
                    <tr key={index}>
                      <td>{w.sNo}</td>
                      <td>{w.memberId}</td>
                      <td>{w.name}</td>
                      <td>{new Date(w.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                      <td>{w.rewardName}</td>
                      <td>
                        {w.rewardImage ? (
                          <img src={w.rewardImage} alt="Reward" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          '---'
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No lucky draw winners found.</td>
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

export default LuckyDrawWinners;
