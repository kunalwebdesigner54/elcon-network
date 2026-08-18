// p2pfrontend/src/Components/Admin/AdminLogin/AdminLogin.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../../api/authService';
import './AdminLogin.css';

/**
 * Admin Login Component
 * Handles admin authentication using backend API
 * Hard-coded credentials: admin@gmail.com / admin123
 */
function AdminLogin() {
	const [email, setEmail] = useState('admin@gmail.com');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);
	const navigate = useNavigate();

	/**
	 * Handle admin login
	 * Calls backend API and stores JWT token on success
	 */
	const handleLogin = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess(false);
		setLoading(true);

		try {
			// Validate email format
			if (!email || !password) {
				setError('Please enter both email and password');
				setLoading(false);
				return;
			}

			// Validate that email is admin account
			if (email !== 'admin@gmail.com') {
				setError('Only admin account (admin@gmail.com) can login here');
				setLoading(false);
				return;
			}

			const data = await loginUser({ email, password });

			if (data?.user?.role !== 'admin') {
				setError('Not an admin account');
				setLoading(false);
				return;
			}

			if (data.token) {
				localStorage.setItem('token', data.token);
				localStorage.setItem('user', JSON.stringify(data.user));

				// Show success message
				setSuccess(true);
				setPassword('');

				// Redirect to admin dashboard after 1 second
				setTimeout(() => {
				navigate('/dashboard');
				}, 1000);
			} else {
				setError('Login failed. Please try again.');
				setLoading(false);
			}
		} catch (err) {
			setError(
				err?.response?.data?.message || err.message || 'Network error. Please ensure the backend server is reachable.'
			);
			setLoading(false);
		}
	};

	return (
		<div className="admin-login-container">
			<div className="admin-login-wrapper">
				<div className="admin-login-card">
					{/* Header */}
					<div className="admin-login-header">
						<h1 className="admin-login-title">Admin Portal</h1>
						<p className="admin-login-subtitle">Secure Administration Login</p>
					</div>

					{/* Form */}
					<form onSubmit={handleLogin} className="admin-login-form">
						{/* Error Message */}
						{error && <div className="admin-login-error">{error}</div>}

						{/* Success Message */}
						{success && (
							<div className="admin-login-success">
								✓ Login successful! Redirecting to dashboard...
							</div>
						)}

						{/* Email Input */}
						<div className="admin-login-form-group">
							<label htmlFor="email" className="admin-login-label">
								Email Address
							</label>
							<input
								id="email"
								type="email"
								className="admin-login-input"
								placeholder="admin@gmail.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={success}
								readOnly={true}
							/>
							<small className="admin-login-hint">
								Only admin@gmail.com can access this portal
							</small>
						</div>

						{/* Password Input */}
						<div className="admin-login-form-group">
							<label htmlFor="password" className="admin-login-label">
								Password
							</label>
							<input
								id="password"
								type="password"
								className="admin-login-input"
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={success || loading}
								autoComplete="current-password"
							/>
						</div>

						{/* Login Button */}
						<button
							type="submit"
							className={`admin-login-btn ${loading || success ? 'disabled' : ''}`}
							disabled={loading || success}
						>
							{loading ? 'Logging in...' : success ? 'Success!' : 'Login to Admin Panel'}
						</button>
					</form>

					{/* Footer */}
					<div className="admin-login-footer">
						<p className="admin-login-footer-text">
							For security reasons, only authorized administrators can access this portal
						</p>
					</div>
				</div>

				{/* Background decoration */}
				<div className="admin-login-decoration"></div>
			</div>
		</div>
	);
}

export default AdminLogin;

