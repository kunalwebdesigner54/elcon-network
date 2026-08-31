import '../../Common/UserLayout.css';
import './UpdateTransPassword.css';
import { useState } from 'react';
import { updateTransactionPassword } from '../../../../api/authService';

function UpdateTransPassword() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateTransactionPassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword,
    })
      .then((response) => {
        window.alert(response.message || 'Transaction password updated successfully');
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      })
      .catch((error) => {
        window.alert(error?.response?.data?.message || 'Unable to update transaction password');
      });
  };

  return (
    <div>
      <h1 className="user-page-title">Update Transaction Password</h1>
      <div className="user-panel">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray)', textTransform: 'uppercase' }}>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="Enter Current Password"
                required
                style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '14px', outline: 'none', width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray)', textTransform: 'uppercase' }}>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Enter New Password"
                required
                style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '14px', outline: 'none', width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray)', textTransform: 'uppercase' }}>Re-type New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-type New Password"
                required
                style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '14px', outline: 'none', width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '40px' }}>
            <div style={{ display: 'flex', gap: '15px', width: '300px' }}>
              <button type="submit" style={{ flex: '1', padding: '12px 20px', borderRadius: '8px', border: 'none', background: 'var(--gradient-primary)', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s ease' }}>
                Update
              </button>
              <button type="button" onClick={() => setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })} style={{ flex: '1', padding: '12px 20px', borderRadius: '8px', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', fontSize: '14px', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s ease' }}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateTransPassword;
