import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestAdminPasswordReset } from '../api/authService';

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await requestAdminPasswordReset(email);
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 420, margin: '80px auto', padding: 32 }}>
      <h1>Forgot Admin Password</h1>
      <p>Enter your registered admin email to receive a secure reset link.</p>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Admin email" style={{ width: '100%', padding: 12 }} />
      <button type="submit" disabled={loading} style={{ marginTop: 16, padding: 12 }}>
        {loading ? 'Sending...' : 'Send reset link'}
      </button>
      <p><Link to="/admin/login">Back to login</Link></p>
    </form>
  );
}
