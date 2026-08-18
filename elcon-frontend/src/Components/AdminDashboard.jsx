import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAdminDashboard } from '../api/dashboardService';

function AdminDashboard({ metrics }) {
	const navigate = useNavigate();
	const storedUser = localStorage.getItem('user');
	let adminName = 'Admin';

	if (storedUser) {
		try {
			const parsedUser = JSON.parse(storedUser);
			adminName = parsedUser?.name || adminName;
		} catch (error) {
			adminName = 'Admin';
		}
	}

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		navigate('/admin/login');
	};

	return (
		<div
			style={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
				padding: '24px',
				color: '#fff',
			}}
		>
			<div
				style={{
					width: '100%',
					maxWidth: '760px',
					background: 'rgba(255,255,255,0.08)',
					backdropFilter: 'blur(16px)',
					border: '1px solid rgba(255,255,255,0.12)',
					borderRadius: '20px',
					padding: '24px',
					boxShadow: '0 20px 60px rgba(0,0,0,0.28)',
				}}
			>
				<h1 style={{ margin: 0, fontSize: '2rem' }}>Admin Dashboard</h1>
				<p style={{ margin: '8px 0 16px', color: 'rgba(255,255,255,0.8)' }}>
					Welcome back, {adminName}. You are signed in as an administrator.
				</p>

				{metrics ? (
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
						<div style={{ padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
							<div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Total Users</div>
							<div style={{ fontSize: 20, fontWeight: 700 }}>{metrics.totalUsers}</div>
						</div>
						<div style={{ padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
							<div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>New (7d)</div>
							<div style={{ fontSize: 20, fontWeight: 700 }}>{metrics.newUsersLast7Days}</div>
						</div>
						<div style={{ padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
							<div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Users with Bank</div>
							<div style={{ fontSize: 20, fontWeight: 700 }}>{metrics.usersWithBank}</div>
						</div>
						<div style={{ padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
							<div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Admins</div>
							<div style={{ fontSize: 20, fontWeight: 700 }}>{metrics.totalAdmins}</div>
						</div>
					</div>
				) : (
					<div style={{ color: 'rgba(255,255,255,0.7)' }}>Loading metrics...</div>
				)}

				<div style={{ marginTop: 18 }}>
					<button
						type="button"
						onClick={handleLogout}
						style={{
							padding: '10px 14px',
							border: 'none',
							borderRadius: '8px',
							background: '#ef4444',
							color: '#fff',
							fontWeight: 700,
							cursor: 'pointer',
						}}
					>
						Logout
					</button>
				</div>
			</div>
		</div>
	);
}

function AdminDashboardWrapper() {
	const [metrics, setMetrics] = useState(null);

	useEffect(() => {
		let mounted = true;
		const fetch = async () => {
			try {
				const res = await getAdminDashboard();
				if (mounted && res?.success) setMetrics(res.data);
			} catch (err) {
				// ignore for now
			}
		};
		fetch();
		return () => (mounted = false);
	}, []);

	return <AdminDashboard metrics={metrics} />;
}

export default AdminDashboardWrapper;
