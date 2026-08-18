import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/authService';

function AdminLogin() {
	const [email, setEmail] = useState('admin@gmail.com');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError('');
		setLoading(true);

		try {
			const data = await loginUser({ email, password });

			if (data?.user?.role !== 'admin') {
				setError('Not an admin account');
				return;
			}

			localStorage.setItem('token', data.token);
			localStorage.setItem('user', JSON.stringify(data.user));
			navigate('/dashboard');
		} catch (requestError) {
			const message = requestError?.response?.data?.message || 'Invalid admin credentials';
			setError(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			style={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
				padding: '24px',
			}}
		>
			<form
				onSubmit={handleSubmit}
				style={{
					width: '100%',
					maxWidth: '420px',
					background: '#fff',
					borderRadius: '18px',
					padding: '32px',
					boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
				}}
			>
				<h1 style={{ marginTop: 0 }}>Admin Login</h1>
				<p style={{ marginTop: '-4px', color: '#64748b' }}>Sign in with the admin account.</p>

				{error ? (
					<div style={{ marginBottom: '16px', color: '#b91c1c', background: '#fef2f2', padding: '10px 12px', borderRadius: '8px' }}>
						{error}
					</div>
				) : null}

				<label htmlFor="admin-email" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
					Email
				</label>
				<input
					id="admin-email"
					type="email"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					style={{ width: '100%', marginBottom: '16px', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
				/>

				<label htmlFor="admin-password" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
					Password
				</label>
				<input
					id="admin-password"
					type="password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					style={{ width: '100%', marginBottom: '20px', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
				/>

				<button
					type="submit"
					disabled={loading}
					style={{
						width: '100%',
						padding: '12px 14px',
						border: 'none',
						borderRadius: '8px',
						background: loading ? '#94a3b8' : '#2563eb',
						color: '#fff',
						fontWeight: 700,
						cursor: loading ? 'not-allowed' : 'pointer',
					}}
				>
					{loading ? 'Signing in...' : 'Login'}
				</button>
			</form>
		</div>
	);
}

export default AdminLogin;
