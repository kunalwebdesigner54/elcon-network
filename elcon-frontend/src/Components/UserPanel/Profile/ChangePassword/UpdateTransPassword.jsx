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
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            placeholder="Enter Current Password"
            required
          />
          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="Enter New Password"
            required
          />
          <label>Re-type New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-type New Password"
            required
          />
          <div className="btn-row">
            <button className="user-btn-blue" type="submit">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateTransPassword;
