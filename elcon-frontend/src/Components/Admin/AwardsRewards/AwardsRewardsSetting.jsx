import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './AwardsRewardsSetting.css';

const AwardsRewardsSetting = () => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    targetDirects: '',
    targetUpgradeLevel: '',
    rewardName: '',
    popupImage: '',
    transactionPassword: ''
  });
  const [fileName, setFileName] = useState('');
  const [activeContest, setActiveContest] = useState(null);

  useEffect(() => {
    fetchActiveContest();
  }, []);

  const fetchActiveContest = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/rewards/contest/active`);
      if (res.data.success) {
        setActiveContest(res.data.contest);
      }
    } catch (error) {
      console.error('Error fetching active contest', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, popupImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/rewards/contest`,
        formData,
        { withCredentials: true }
      );
      if (res.data.success) {
        Swal.fire('Success', 'Reward Contest created successfully', 'success');
        setFormData({
          startDate: '', endDate: '', targetDirects: '', targetUpgradeLevel: '', rewardName: '', popupImage: '', transactionPassword: ''
        });
        setFileName('');
        fetchActiveContest();
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to create contest', 'error');
    }
  };

  return (
    <div className="awards-rewards-container">
      <div className="awards-rewards-card">
        <h2 className="awards-rewards-title">AWARD & REWARD SETTING</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section-header">SET REWARDS TIME PERIOD</div>
          
          <div className="ar-form-group">
            <label className="ar-form-label">START DATE</label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="ar-form-input" required />
          </div>
          
          <div className="ar-form-group">
            <label className="ar-form-label">END DATE</label>
            <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="ar-form-input" required />
          </div>

          <div className="form-section-header">SET REWARDS TARGET</div>
          
          <div className="ar-row">
            <div className="ar-col">
              <label className="ar-form-label">NEW DIRECTS</label>
              <input type="number" name="targetDirects" value={formData.targetDirects} onChange={handleInputChange} className="ar-form-input" required />
            </div>
            <div className="ar-col">
              <label className="ar-form-label">UPGRADE LEVEL</label>
              <input type="number" name="targetUpgradeLevel" value={formData.targetUpgradeLevel} onChange={handleInputChange} className="ar-form-input" required />
            </div>
            <div className="ar-col">
              <label className="ar-form-label">REWARD</label>
              <input type="text" name="rewardName" value={formData.rewardName} onChange={handleInputChange} className="ar-form-input" required />
            </div>
          </div>

          <div className="ar-form-group">
            <label className="ar-form-label">INSERT AWARDS POPUP IMAGE HERE</label>
            <div className="ar-file-upload">
              <label className="ar-file-btn">
                UPLOAD IMAGE
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
              <div className="ar-file-name">{fileName || ''}</div>
            </div>
          </div>

          <div className="ar-form-group">
            <label className="ar-form-label">ADMIN TRANSACTION PASSWORD</label>
            <input type="password" name="transactionPassword" value={formData.transactionPassword} onChange={handleInputChange} className="ar-form-input" required />
          </div>

          <button type="submit" className="ar-submit-btn">SAVE</button>
        </form>

        <h3 className="ar-table-title">CURRENT RUNNING REWARDS CONTEST</h3>
        <table className="ar-table">
          <thead>
            <tr>
              <th>START DATE</th>
              <th>END DATE</th>
              <th>NEW DIRECTS</th>
              <th>UPGRADE LEVEL</th>
              <th>REWARD</th>
            </tr>
          </thead>
          <tbody>
            {activeContest ? (
              <tr>
                <td>{new Date(activeContest.startDate).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                <td>{new Date(activeContest.endDate).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                <td>{activeContest.targetDirects}</td>
                <td>{activeContest.targetUpgradeLevel}</td>
                <td>{activeContest.rewardName}</td>
              </tr>
            ) : (
              <tr>
                <td colSpan="5">No active contest</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AwardsRewardsSetting;
