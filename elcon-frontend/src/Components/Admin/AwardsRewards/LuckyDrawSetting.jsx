import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './AwardsRewardsSetting.css'; // Reusing the same CSS

const LuckyDrawSetting = () => {
  const [formData, setFormData] = useState({
    serialNo: '',
    memberId: '',
    memberName: '',
    drawDate: '',
    rewardName: '',
    rewardImage: '',
    transactionPassword: ''
  });
  const [fileName, setFileName] = useState('');

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
        setFormData(prev => ({ ...prev, rewardImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/luckydraw/winner`,
        formData,
        { withCredentials: true }
      );
      if (res.data.success) {
        Swal.fire('Success', 'Lucky Draw Winner added successfully', 'success');
        setFormData({
          serialNo: '', memberId: '', memberName: '', drawDate: '', rewardName: '', rewardImage: '', transactionPassword: ''
        });
        setFileName('');
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to add winner', 'error');
    }
  };

  return (
    <div className="awards-rewards-container">
      <div className="awards-rewards-card">
        <h2 className="awards-rewards-title">LUCKY DROW</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section-header">ADD LUCKY DROW WINNER</div>
          
          <div className="ar-row">
            <div className="ar-col">
              <label className="ar-form-label">SERIAL NO.</label>
              <input type="number" name="serialNo" value={formData.serialNo} onChange={handleInputChange} className="ar-form-input" required />
            </div>
            <div className="ar-col">
              <label className="ar-form-label">MEMBER ID</label>
              <input type="text" name="memberId" value={formData.memberId} onChange={handleInputChange} className="ar-form-input" required />
            </div>
            <div className="ar-col">
              <label className="ar-form-label">MEMBER NAME</label>
              <input type="text" name="memberName" value={formData.memberName} onChange={handleInputChange} className="ar-form-input" required />
            </div>
          </div>

          <div className="ar-row">
            <div className="ar-col">
              <label className="ar-form-label">DROW DATE</label>
              <input type="date" name="drawDate" value={formData.drawDate} onChange={handleInputChange} className="ar-form-input" required />
            </div>
            <div className="ar-col">
              <label className="ar-form-label">REWARD NAME</label>
              <input type="text" name="rewardName" value={formData.rewardName} onChange={handleInputChange} className="ar-form-input" required />
            </div>
            <div className="ar-col">
              <label className="ar-form-label">UPLOAD IMAGE</label>
              <div className="ar-file-upload">
                <label className="ar-file-btn" style={{ padding: '12px', fontSize: '0.8rem' }}>
                  UPLOAD IMAGE
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} required />
                </label>
                <div className="ar-file-name" style={{ fontSize: '0.8rem', padding: '12px 5px' }}>{fileName || ''}</div>
              </div>
            </div>
          </div>

          <div className="ar-form-group">
            <label className="ar-form-label">TRANSACTION PASSWORD</label>
            <input type="password" name="transactionPassword" value={formData.transactionPassword} onChange={handleInputChange} className="ar-form-input" required />
          </div>

          <button type="submit" className="ar-submit-btn">SAVE</button>
        </form>
      </div>
    </div>
  );
};

export default LuckyDrawSetting;
