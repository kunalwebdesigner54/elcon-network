import { useEffect, useState } from 'react';
import './Dashboard.css';
import { getAdminFullDashboard } from '../../../api/dashboardService';
import { getUser } from '../../../utils/auth';
import { getProfile } from '../../../api/authService';
import dashboard1 from '../../../Assets/Pictures/dashbaord1.jpeg';
import dashboard2 from '../../../Assets/Pictures/dashbaord2.jpeg';
import dashboard3 from '../../../Assets/Pictures/dashbaord3.jpeg';
import dashboard4 from '../../../Assets/Pictures/dashbaord4.jpeg';
import dashboard5 from '../../../Assets/Pictures/dashbaord5.jpeg';

const bannerSlides = [dashboard1, dashboard2, dashboard3, dashboard4, dashboard5];

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
	const [activeSlide, setActiveSlide] = useState(0);
	const [stats, setStats] = useState(defaultAdminStats);
	const user = getUser() || {};
	const [adminName, setAdminName] = useState(user.name || (user.adminType === 'SUB_ADMIN' ? 'Sub Administrator' : 'Administrator'));
	const [adminUserId, setAdminUserId] = useState(user.memberId || user.id || user._id || 'N/A');

	useEffect(() => {
		const timer = window.setInterval(() => {
			setActiveSlide((current) => (current + 1) % bannerSlides.length);
		}, 3500);

		return () => window.clearInterval(timer);
	}, []);

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

	const goToPreviousSlide = () => {
		setActiveSlide((current) => (current - 1 + bannerSlides.length) % bannerSlides.length);
	};

	const goToNextSlide = () => {
		setActiveSlide((current) => (current + 1) % bannerSlides.length);
	};

	return (
    <div className="admin-dashboard-shell">
      <div className="admin-dashboard-root">
        
        {/* STATS ROW */}
        <section className="dashboard-stats-row">
          <div className="dash-stat-card">
            <div className="dash-stat-info">
              <h3>$84.00K</h3>
              <p>Total Order</p>
              <span className="dash-stat-trend up">+17.5% Than Last Week</span>
            </div>
            <div className="dash-stat-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-info">
              <h3>3.00M</h3>
              <p>Product Views</p>
              <span className="dash-stat-trend up">+17.5% Than Last Week</span>
            </div>
            <div className="dash-stat-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-info">
              <h3>12.00K</h3>
              <p>Total Customers</p>
              <span className="dash-stat-trend up">+17.5% Than Last Week</span>
            </div>
            <div className="dash-stat-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-info">
              <h3>$59.00K</h3>
              <p>Total Income</p>
              <span className="dash-stat-trend up">+17.5% Than Last Week</span>
            </div>
            <div className="dash-stat-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </div>
          </div>
        </section>

        {/* CHARTS ROW */}
        <section className="dashboard-charts-row">
          <div className="dash-chart-card sales-overview">
            <h4 className="dash-card-title">Sales Overview</h4>
            <div className="dash-chart-area">
              {/* Dummy SVG line chart to match Figma */}
              <svg viewBox="0 0 800 300" className="svg-line-chart" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A855F7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M0,150 Q50,180 100,100 T200,180 T300,50 T400,150 T500,40 T600,60 T700,120 T800,20 L800,300 L0,300 Z" fill="url(#line-grad)" />
                <path d="M0,150 Q50,180 100,100 T200,180 T300,50 T400,150 T500,40 T600,60 T700,120 T800,20" fill="none" stroke="#A855F7" strokeWidth="4" />
                <circle cx="500" cy="40" r="6" fill="#FACC15" stroke="#fff" strokeWidth="3" />
                
                {/* Tooltip SVG */}
                <g transform="translate(420, 10)">
                  <rect width="100" height="40" rx="8" fill="#FACC15" />
                  <text x="50" y="16" fill="#13111C" fontSize="12" fontWeight="bold" textAnchor="middle">1,348 sales</text>
                  <text x="50" y="30" fill="#13111C" fontSize="12" textAnchor="middle">$3,348</text>
                  <polygon points="50,40 45,45 55,45" fill="#FACC15" transform="rotate(180 50 42) translate(0, -3)" />
                </g>
                <line x1="500" y1="46" x2="500" y2="280" stroke="#A855F7" strokeWidth="2" strokeDasharray="5,5" />
              </svg>
              <div className="chart-x-axis">
                <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span><span>DEC</span>
              </div>
              <div className="chart-y-axis">
                <span>5k</span><span>4k</span><span>3k</span><span>2k</span><span>1k</span><span>0</span>
              </div>
            </div>
          </div>
        </section>

        {/* MIDDLE ROW */}
        <section className="dashboard-middle-row">
          <div className="dash-card customer-satisfaction">
            <h4 className="dash-card-title">Customer Satisfaction</h4>
            <div className="progress-group">
              <div className="progress-label"><span>Excellent/5 Star</span><span>70%</span></div>
              <div className="progress-track"><div className="progress-fill purple" style={{width: '70%'}}></div></div>
            </div>
            <div className="progress-group">
              <div className="progress-label"><span>Very Good/4 Star</span><span>22%</span></div>
              <div className="progress-track"><div className="progress-fill green" style={{width: '22%'}}></div></div>
            </div>
            <div className="progress-group">
              <div className="progress-label"><span>Good/3 Star</span><span>18%</span></div>
              <div className="progress-track"><div className="progress-fill yellow" style={{width: '18%'}}></div></div>
            </div>
            <div className="progress-group">
              <div className="progress-label"><span>Poor/2 Star</span><span>7%</span></div>
              <div className="progress-track"><div className="progress-fill blue" style={{width: '7%'}}></div></div>
            </div>
            <div className="progress-group">
              <div className="progress-label"><span>Very Poor/1 Star</span><span>4%</span></div>
              <div className="progress-track"><div className="progress-fill dark-blue" style={{width: '4%'}}></div></div>
            </div>
          </div>
          
          <div className="dash-card audience">
            <h4 className="dash-card-title">Audience</h4>
            <div className="audience-chart-wrapper">
              <svg viewBox="0 0 100 100" className="donut-chart">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#A855F7" strokeWidth="15" strokeDasharray="188 63" transform="rotate(-90 50 50)"></circle>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#EAB308" strokeWidth="15" strokeDasharray="63 188" transform="rotate(135 50 50)"></circle>
                <text x="50" y="48" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold">1.05</text>
                <text x="50" y="58" textAnchor="middle" fill="#9CA3AF" fontSize="8">Average range</text>
                
                <text x="80" y="30" fill="#fff" fontSize="10" fontWeight="bold">75%</text>
                <text x="20" y="70" fill="#13111C" fontSize="10" fontWeight="bold">25%</text>
              </svg>
              <div className="audience-legend">
                <div className="legend-item"><span className="dot purple"></span><div><p>Total Subscribed</p><strong>279M</strong></div></div>
                <div className="legend-item"><span className="dot yellow"></span><div><p>New User</p><strong>8900K</strong></div></div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM TABLE */}
        <section className="dashboard-table-row">
          <div className="dash-card deals-static">
            <h4 className="dash-card-title">Deals Static</h4>
            <div className="table-responsive">
              <table className="deals-table">
                <thead>
                  <tr>
                    <th>Sales Rep</th>
                    <th>Category</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {name: 'Parller Hok', cat: 'Development', email: 'parller@gmail.com', loc: 'United Kingdom', date: 'Oct 15 - Dec 20, 2024'},
                    {name: 'John Doe', cat: 'Designing', email: 'john@gmail.com', loc: 'United States', date: 'Sep 03 - Dec 24, 2024'},
                    {name: 'Emily Davis', cat: 'Backend', email: 'emily@gmail.com', loc: 'France', date: 'Oct 15 - Dec 20, 2024'},
                    {name: 'Olivia Brown', cat: 'Designing', email: 'olivia@gmail.com', loc: 'United States', date: 'Sep 03 - Dec 24, 2024'},
                    {name: 'Daniel Wilson', cat: 'Frontend', email: 'daniel@gmail.com', loc: 'Germany', date: 'Oct 15 - Dec 20, 2024'}
                  ].map((row, i) => (
                    <tr key={i}>
                      <td>
                        <div className="table-avatar-cell">
                          <img src={`https://i.pravatar.cc/150?img=${i+10}`} alt="avatar" />
                          <span>{row.name}</span>
                        </div>
                      </td>
                      <td>{row.cat}</td>
                      <td>{row.email}</td>
                      <td>{row.loc}</td>
                      <td>{row.date}</td>
                      <td>
                        <div className="table-actions">
                          <button className="action-btn download"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button>
                          <button className="action-btn edit"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>
    </div>
	);
}

export default Dashboard;
