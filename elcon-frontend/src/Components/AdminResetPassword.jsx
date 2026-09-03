import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { resetAdminPassword } from '../api/authService';

export default function AdminResetPassword() {
  const { token } = useParams();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await resetAdminPassword({ token, ...form });
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to reset password');
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 420, margin: '80px auto', padding: 32 }}>
      <h1>Reset Admin Password</h1>
      {message ? <><p style={{ color: 'green' }}>{message}</p><Link to="/admin/login">Go to admin login</Link></> : <>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <input type="password" required minLength="6" placeholder="New password" value={form.newPassword} onChange={(event) => setForm({ ...form, newPassword: event.target.value })} style={{ display: 'block', width: '100%', padding: 12, marginBottom: 12 }} />
        <input type="password" required minLength="6" placeholder="Confirm password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} style={{ display: 'block', width: '100%', padding: 12, marginBottom: 16 }} />
        <button type="submit" style={{ padding: 12 }}>Reset password</button>
      </>}
    </form>
  );
}
