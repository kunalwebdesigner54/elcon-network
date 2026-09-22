import { useEffect, useState } from 'react';
import './Dashboard.css';
import { getAdminFullDashboard } from '../../../api/dashboardService';
import { getUser } from '../../../utils/auth';
import { getProfile } from '../../../api/authService';


const defaultAdminStats = [
	{ label: 'Total Joining Turnover', value: '₹ 0' },
	{ label: 'Profit on Joining', value: '₹ 0' },
	{ label: 'Total Donation Amount', value: '₹ 0' },
	{ label: "Yesterday's Donation Amount", value: '₹ 0' },
	{ label: 'Total Level Income', value: '₹ 0' },
	{ label: "Yesterday's Level Income", value: '₹ 0' },
	{ label: 'Total Repurchase Income', value: '₹ 0' },
	{ label: "Yesterday's Repurchase Income", value: '₹ 0' },
	{ label: 'Generated Total Income', value: '₹ 0' },
	{ label: 'Total Deducted Charges', value: '₹ 0' },
	{ label: 'Total Payout Amount', value: '₹ 0' },
	{ label: 'Succeed Payout', value: '₹ 0' },
	{ label: 'Awaiting Payout Request', value: '₹ 0' },
	{ label: 'Pending Payout', value: '₹ 0' },
	{ label: 'TDS Deducted 5%', value: '₹ 0' },
	{ label: 'Deducted Admin Charge 5%', value: '₹ 0' },
	{ label: 'Total Joining Members', value: '0' },
	{ label: "Today's Joining Members", value: '0' },
	{ label: 'Active Members', value: '0' },
	{ label: 'In-Active Members', value: '0' },
	{ label: 'Total Generated ePins', value: '0' },
	{ label: 'Pending ePin Request', value: '0' },
	{ label: 'Used ePins', value: '0' },
	{ label: 'Unused ePins', value: '0' },
	{ label: 'Alloted ePins', value: '0' },
	{ label: 'Unallotted ePins', value: '0' },
	{ label: 'Total sales Packages', value: '0' },
	{ label: 'Delivered Package', value: '0' },
	{ label: 'Awaiting Package Request', value: '0' },
	{ label: 'Pending Package Orders', value: '0' },
	{ label: 'Development Fund', value: '₹ 0' },
	{ label: 'Product Fund', value: '₹ 0' },
	{ label: 'Total Coupons', value: '0' },
	{ label: 'Used Coupons', value: '0' },
	{ label: 'Active Coupons', value: '0' },
	{ label: 'Expired Coupons', value: '0' }
];

function Dashboard() {
	const [stats, setStats] = useState(defaultAdminStats);
	const user = getUser() || {};
	const [adminName, setAdminName] = useState(user.name || (user.adminType === 'SUB_ADMIN' ? 'Sub Administrator' : 'Administrator'));
	const [adminUserId, setAdminUserId] = useState(user.memberId || user.id || user._id || 'N/A');



	useEffect(() => {
		let mounted = true;
		getProfile()
			.then((response) => {
				if (!mounted || !response?.success || !response.data) return;
				setAdminName(response.data.name || (response.data.adminType === 'SUB_ADMIN' ? 'Sub Administrator' : 'Administrator'));
				setAdminUserId(response.data.memberId || response.data._id || 'N/A');
			})
			.catch(() => { });

		return () => {
			mounted = false;
		};
	}, []);

	useEffect(() => {
		let mounted = true;
		const fetch = async () => {
			try {
				const res = await getAdminFullDashboard();
				if (mounted && res?.success && res.data?.stats) {
					setStats(res.data.stats);
				}
			} catch (err) {
				// ignore — keep defaults
			}
		};
		fetch();
		return () => (mounted = false);
	}, []);



	return (
		<div className="admin-dashboard-shell">
			<div className="admin-dashboard-root">




				<div className="admin-dashboard-news-bar" role="status" aria-live="polite">
					<span className="admin-dashboard-news-label"> NEWS</span>
					<div className="admin-dashboard-news-track">
						<div className="admin-dashboard-news-marquee">KYC is mandatory! Complete your KYC to receive payouts.</div>
					</div>
				</div>

				<section className="admin-dashboard-profile-header">
					<h1 className="admin-dashboard-profile-title">ELCON NETWORK</h1>
					<p className="admin-dashboard-profile-meta">
						Admin: {adminName} | Admin User ID: {adminUserId}
					</p>
				</section>

				<section className="admin-dashboard-stats-grid" aria-label="Admin dashboard metrics">
					{stats.map((stat, index) => {
						// Alternate generic icons based on index for visual variety (Basket, Box, User, Wallet)
						const icons = ['fa-solid fa-basket-shopping', 'fa-solid fa-box', 'fa-regular fa-user', 'fa-solid fa-wallet'];
						const icon = icons[index % 4];

						return (
							<article className="admin-dashboard-stat-card" key={stat.label}>
								<div className="admin-dashboard-stat-content">
									<div className="admin-dashboard-stat-value">{stat.value}</div>
									<div className="admin-dashboard-stat-label">{stat.label}</div>
								</div>
								<div className="admin-dashboard-stat-icon-box">
									<i className={`admin-dashboard-stat-icon ${icon}`}></i>
								</div>
							</article>
						);
					})}
				</section>

				<div className="admin-dashboard-bottom-band" />
			</div>
		</div>
	);
}

export default Dashboard;
