import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicPageHeader from '../../Public/Common/PublicPageHeader';
import { loginUser } from '../../../api/authService';
import './UserLogin.css';

function UserLogin() {
	const navigate = useNavigate();
	const [memberId, setMemberId] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError('');
		setLoading(true);

		try {
			const data = await loginUser({ memberId, password });
			localStorage.setItem('token', data.token);
			localStorage.setItem('user', JSON.stringify(data.user));

			if (data?.user?.role === 'admin') {
				navigate('/dashboard');
				return;
			}

			navigate('/user/dashboard');
		} catch (requestError) {
            const responseData = requestError?.response?.data;
            const message = responseData?.errors?.[0]?.msg || responseData?.message || 'Invalid login credentials';
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<PublicPageHeader title="Login" />
			<section className="public-page">
				<div className="public-container user-login-wrap">
					<form className="user-login-card" onSubmit={handleSubmit}>
						{error ? (
							<div style={{ color: '#b91c1c', background: '#fef2f2', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px' }}>
								{error}
							</div>
						) : null}
						<label>Member ID</label>
						<input
							type="text"
							placeholder="Enter your Member ID (e.g. EL12345678)"
							value={memberId}
							onChange={(event) => setMemberId(event.target.value)}
						/>
						<label>Password</label>
						<input
							type="password"
							placeholder="Enter Password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
						/>
						<button type="submit" disabled={loading}>
							{loading ? 'Logging in...' : 'Login Now'}
						</button>
						<button type="button" onClick={() => navigate('/admin/login')}>
							Login Admin 
						</button>
						<p>
							Not a member? <span onClick={() => navigate('/registration')}>Create a new account</span>
						</p>
						<small>Forgot your Password? Click here</small>
					</form>
				</div>
			</section>
		</div>
	);
}

export default UserLogin;
