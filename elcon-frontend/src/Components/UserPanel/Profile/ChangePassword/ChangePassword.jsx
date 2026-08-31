import '../../Common/UserLayout.css';
import './ChangePassword.css';
import { useState, useEffect } from 'react';
import { changePassword, getProfile } from '../../../../api/authService';

function ChangePassword() {
  const [memberId, setMemberId] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load member ID on mount
  useEffect(() => {
    const loadMemberId = async () => {
      try {
        const response = await getProfile();
        if (response.success) {
          setMemberId(response.data.memberId || '');
        }
      } catch (err) {
        console.error('Error loading member ID:', err);
        setError('Failed to load member ID');
      } finally {
        setLoading(false);
      }
    };
    loadMemberId();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      setSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      setSubmitting(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setSubmitting(false);
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to change password');
      console.error('Error changing password:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage('');
    setError('');
  };

  if (loading) {
    return (
      <div>
        <h1 className="user-page-title">Change Login Password</h1>
        <div className="user-panel">
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="user-page-title">Change Login Password</h1>
      <div className="user-panel">
        {message && <div style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>{message}</div>}
        {error && <div style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Member ID</label>
              <input 
                value={memberId} 
                disabled 
                style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.2)', color: 'var(--text-muted)', fontSize: '15px', outline: 'none' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Present Login Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '15px', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>New Login Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '15px', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Confirm New Login Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '15px', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button type="submit" disabled={submitting} style={{ flex: '1', padding: '14px', borderRadius: '8px', border: 'none', background: 'var(--gradient-primary)', color: '#fff', fontSize: '15px', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s ease' }}>
                {submitting ? 'Updating...' : 'Update'}
              </button>
              <button type="button" onClick={handleCancel} style={{ flex: '1', padding: '14px', borderRadius: '8px', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', fontSize: '15px', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s ease' }}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
