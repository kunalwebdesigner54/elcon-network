import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../api/config';
import { getUser } from '../../utils/auth';
import Swal from 'sweetalert2';
import '../Admin/AwardsRewards/AwardsRewardsSetting.css'; // Reusing table styles

const LuckyDrawWinners = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = useMemo(() => {
    try {
      const storedUser = getUser() || {};
      return ['admin', 'SUPER_ADMIN', 'SUB_ADMIN'].includes(storedUser.role) || 
             ['SUPER_ADMIN', 'SUB_ADMIN'].includes(storedUser.adminType);
    } catch (error) {
      return false;
    }
  }, []);

  const fetchWinners = async () => {
    try {
      const res = await apiClient.get(`/luckydraw/winners`, {
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

  useEffect(() => {
    fetchWinners();
  }, []);

  const handleHide = async (id, currentHiddenStatus) => {
    try {
      const res = await apiClient.patch(`/luckydraw/winners/${id}/hide`, {}, { withCredentials: true });
      if (res.data.success) {
        Swal.fire('Success', res.data.message, 'success');
        fetchWinners();
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to update visibility', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirm.isConfirmed) {
      try {
        const res = await apiClient.delete(`/luckydraw/winners/${id}`, { withCredentials: true });
        if (res.data.success) {
          Swal.fire('Deleted!', 'The winner has been deleted.', 'success');
          fetchWinners();
        }
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Failed to delete winner', 'error');
      }
    }
  };

  return (
    <div className="awards-rewards-container">
      <div className="awards-rewards-card">
        <h2 className="awards-rewards-title" style={{ marginBottom: '24px' }}>LUCKY DRAW WINNER LIST</h2>
        
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
                  {isAdmin && <th>Action</th>}
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
                      {isAdmin && (
                        <td>
                          <button 
                            style={{ padding: '4px 8px', marginRight: '5px', borderRadius: '4px', border: 'none', background: w.isHidden ? '#10b981' : '#f59e0b', color: '#fff', cursor: 'pointer' }}
                            onClick={() => handleHide(w._id, w.isHidden)}
                          >
                            {w.isHidden ? 'SHOW' : 'HIDE'}
                          </button>
                          <button 
                            style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer' }}
                            onClick={() => handleDelete(w._id)}
                          >
                            DELETE
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? "7" : "6"}>No lucky draw winners found.</td>
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
