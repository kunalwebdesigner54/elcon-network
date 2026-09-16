import React, { useState, useEffect } from 'react';
import apiClient from '../../../api/config';
import Swal from 'sweetalert2';
import './AwardsRewardsSetting.css';

// Helper: format ISO date to yyyy-MM-dd for <input type="date">
const toInputDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
};

// Helper: format date for display
const toDisplayDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB').replace(/\//g, '-');
};

const AwardsRewardsSetting = () => {
  const [formData, setFormData] = useState({
    startDate: '', endDate: '', targetDirects: '', targetUpgradeLevel: '',
    rewardName: '', popupImage: '', transactionPassword: ''
  });
  const [fileName, setFileName] = useState('');
  const [activeContest, setActiveContest] = useState(null);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    startDate: '', endDate: '', targetDirects: '', targetUpgradeLevel: '',
    rewardName: '', transactionPassword: ''
  });
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchActiveContest();
  }, []);

  const fetchActiveContest = async () => {
    try {
      const res = await apiClient.get(`/rewards/contest/active`);
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
      const res = await apiClient.post(`/rewards/contest`, formData, { withCredentials: true });
      if (res.data.success) {
        Swal.fire('Success', 'Reward Contest created successfully', 'success');
        setFormData({ startDate: '', endDate: '', targetDirects: '', targetUpgradeLevel: '', rewardName: '', popupImage: '', transactionPassword: '' });
        setFileName('');
        fetchActiveContest();
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to create contest', 'error');
    }
  };

  // ─── EDIT ────────────────────────────────────────
  const handleEditClick = () => {
    if (!activeContest) return;
    setEditData({
      startDate: toInputDate(activeContest.startDate),
      endDate: toInputDate(activeContest.endDate),
      targetDirects: activeContest.targetDirects,
      targetUpgradeLevel: activeContest.targetUpgradeLevel,
      rewardName: activeContest.rewardName,
      transactionPassword: ''
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editData.transactionPassword.trim()) {
      Swal.fire('Error', 'Transaction Password is required', 'error');
      return;
    }
    try {
      setEditLoading(true);
      const res = await apiClient.put(`/rewards/contest/${activeContest._id}`, editData, { withCredentials: true });
      if (res.data.success) {
        Swal.fire('Success', 'Contest updated successfully', 'success');
        setEditModalOpen(false);
        fetchActiveContest();
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to update contest', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // ─── DELETE ──────────────────────────────────────
  const handleDeleteClick = () => {
    setDeletePassword('');
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (e) => {
    e.preventDefault();
    if (!deletePassword.trim()) {
      Swal.fire('Error', 'Transaction Password is required', 'error');
      return;
    }
    try {
      setDeleteLoading(true);
      const res = await apiClient.delete(`/rewards/contest/${activeContest._id}`, {
        data: { transactionPassword: deletePassword },
        withCredentials: true
      });
      if (res.data.success) {
        Swal.fire('Deleted', 'Contest deleted successfully', 'success');
        setDeleteModalOpen(false);
        setActiveContest(null);
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to delete contest', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="awards-rewards-container">
      <div className="awards-rewards-card">
        <h2 className="awards-rewards-title">AWARD &amp; REWARD SETTING</h2>

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

        {/* ─── CURRENT RUNNING REWARDS CONTEST TABLE ─── */}
        <h3 className="ar-table-title">CURRENT RUNNING REWARDS CONTEST</h3>
        <div className="ar-table-responsive">
          <table className="ar-table">
            <thead>
              <tr>
                <th>START DATE</th>
                <th>END DATE</th>
                <th>NEW DIRECTS</th>
                <th>UPGRADE LEVEL</th>
                <th>REWARD</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {activeContest ? (
                <tr>
                  <td>{toDisplayDate(activeContest.startDate)}</td>
                  <td>{toDisplayDate(activeContest.endDate)}</td>
                  <td>{activeContest.targetDirects}</td>
                  <td>{activeContest.targetUpgradeLevel}</td>
                  <td>{activeContest.rewardName}</td>
                  <td>
                    <div className="ar-actions-cell">
                      <button
                        className="ar-action-btn ar-edit-btn"
                        type="button"
                        title="Edit Contest"
                        onClick={handleEditClick}
                      >
                        ✏️ EDIT
                      </button>
                      <button
                        className="ar-action-btn ar-delete-btn"
                        type="button"
                        title="Delete Contest"
                        onClick={handleDeleteClick}
                      >
                        🗑️ DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="6">No active contest</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── EDIT MODAL ─── */}
      {editModalOpen && (
        <div className="ar-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setEditModalOpen(false); }}>
          <div className="ar-modal">
            <div className="ar-modal-header">
              <span>✏️</span>
              <h3>EDIT REWARD CONTEST</h3>
            </div>
            <form onSubmit={handleEditSubmit} className="ar-modal-form">
              <div className="ar-modal-row">
                <div className="ar-modal-field">
                  <label>START DATE</label>
                  <input type="date" name="startDate" value={editData.startDate} onChange={handleEditChange} className="ar-form-input" required />
                </div>
                <div className="ar-modal-field">
                  <label>END DATE</label>
                  <input type="date" name="endDate" value={editData.endDate} onChange={handleEditChange} className="ar-form-input" required />
                </div>
              </div>
              <div className="ar-modal-row">
                <div className="ar-modal-field">
                  <label>NEW DIRECTS</label>
                  <input type="number" name="targetDirects" value={editData.targetDirects} onChange={handleEditChange} className="ar-form-input" required />
                </div>
                <div className="ar-modal-field">
                  <label>UPGRADE LEVEL</label>
                  <input type="number" name="targetUpgradeLevel" value={editData.targetUpgradeLevel} onChange={handleEditChange} className="ar-form-input" required />
                </div>
              </div>
              <div className="ar-modal-field" style={{ width: '100%' }}>
                <label>REWARD NAME</label>
                <input type="text" name="rewardName" value={editData.rewardName} onChange={handleEditChange} className="ar-form-input" required />
              </div>
              <div className="ar-modal-field" style={{ width: '100%' }}>
                <label>ADMIN TRANSACTION PASSWORD *</label>
                <input type="password" name="transactionPassword" value={editData.transactionPassword} onChange={handleEditChange} className="ar-form-input" required placeholder="Enter transaction password to confirm" />
              </div>
              <div className="ar-modal-actions">
                <button type="button" className="ar-modal-cancel" onClick={() => setEditModalOpen(false)} disabled={editLoading}>CANCEL</button>
                <button type="submit" className="ar-modal-submit" disabled={editLoading}>{editLoading ? 'Saving...' : 'SAVE CHANGES'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE MODAL ─── */}
      {deleteModalOpen && (
        <div className="ar-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setDeleteModalOpen(false); }}>
          <div className="ar-modal ar-modal-sm">
            <div className="ar-modal-header ar-modal-header-danger">
              <span>🗑️</span>
              <h3>DELETE REWARD CONTEST</h3>
            </div>
            <form onSubmit={handleDeleteConfirm} className="ar-modal-form">
              <p style={{ color: '#fca5a5', fontSize: '13px', marginBottom: '12px', lineHeight: 1.5 }}>
                ⚠️ Yeh action undo nahi ho sakti. Contest permanently delete ho jayegi.
              </p>
              <div className="ar-modal-field" style={{ width: '100%' }}>
                <label>ADMIN TRANSACTION PASSWORD *</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="ar-form-input"
                  required
                  placeholder="Enter transaction password to confirm"
                  autoFocus
                />
              </div>
              <div className="ar-modal-actions">
                <button type="button" className="ar-modal-cancel" onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading}>CANCEL</button>
                <button type="submit" className="ar-modal-delete" disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'CONFIRM DELETE'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AwardsRewardsSetting;
