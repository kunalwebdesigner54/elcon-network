import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicPageHeader from '../../Public/Common/PublicPageHeader';
import { loginUser } from '../../../api/authService';
import './UserLogin.css';

function UserLogin() {
	const navigate = useNavigate();
	const [loginId, setLoginId] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError('');
		setLoading(true);

		try {
			const isEmail = loginId.includes('@');
			const payload = isEmail ? { email: loginId, password } : { memberId: loginId, password };
			const data = await loginUser(payload);
			localStorage.setItem('token', data.token);
			localStorage.setItem('user', JSON.stringify(data.user));

			const isAdminUser = data?.user?.role === 'admin'
				|| data?.user?.role === 'SUPER_ADMIN'
				|| data?.user?.role === 'SUB_ADMIN'
				|| data?.user?.adminType === 'SUPER_ADMIN'
				|| data?.user?.adminType === 'SUB_ADMIN';

			if (isAdminUser) {
				navigate('/dashboard');
				return;
			}

			navigate('/user/dashboard');
		} catch (requestError) {
            const responseData = requestError?.response?.data;
            const message = responseData?.errors?.[0]?.msg || responseData?.message || 'Invalid login credentials';
            setError(message);
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
						<label>Member ID or Email</label>
						<input
							type="text"
							placeholder="Enter Member ID or Email"
							value={loginId}
							onChange={(event) => setLoginId(event.target.value)}
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
