import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../Common/UserLayout.css';
import './UserDashboard.css';
import { getUserDashboard, getTopEarners } from '../../../api/dashboardService';
import { getNewsPopupList } from '../../../api/managementService';
import { formatDate } from '../../../utils/dateFormatter';

function MemberDashboard() {
  const [activeTab, setActiveTab] = useState('top');
  const [memberInfo, setMemberInfo] = useState(null);
  const [topEarners, setTopEarners] = useState([]);
  const [loadingTopEarners, setLoadingTopEarners] = useState(false);
  const [newsList, setNewsList] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchDashboard = async () => {
      try {
        const data = await getUserDashboard();
        if (mounted) {
          if (data?.dashboard) {
            setMemberInfo(data.dashboard);
          } else if (data?.success) {
            setMemberInfo(data.data);
          } else {
            setMemberInfo(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    
    const fetchNewsPopups = async () => {
      try {
        const response = await getNewsPopupList();
        if (mounted && response && response.items) {
          // Filter out drafts and items not meant for Member panel
          const published = response.items.filter(item => 
            item.status === 'Published' && 
            (item.displayOn === 'Member panel' || item.displayOn === 'All')
          );
          
          setNewsList(published.filter(i => i.type === 'News and Event' || i.type === 'News'));
          
          const popups = published.filter(i => i.type === 'Popup');
          if (popups.length > 0) {
            // Show the most recent popup
            setActivePopup(popups[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch news and popups:', error);
      }
    };

    fetchDashboard();
    fetchNewsPopups();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchTopEarners = async () => {
      if (activeTab === 'rewards') {
        setTopEarners([]);
        return;
      }
      setLoadingTopEarners(true);
      try {
        const typeMap = { top: 'all', monthly: 'monthly', daily: 'daily' };
        const res = await getTopEarners(typeMap[activeTab]);
        if (mounted && res?.success) setTopEarners(res.data);
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setLoadingTopEarners(false);
      }
    };
    fetchTopEarners();
    return () => (mounted = false);
  }, [activeTab]);

  // Build stats array with real data where available
  const stats = [
    { 
      label: 'Total Income', 
      value: memberInfo?.totalEarning || '0', 
      icon: 'fa-wallet', 
      color: '#00e5ff'
    },
    { 
      label: 'Received Help', 
      value: memberInfo?.receivedHelp || '0', 
      icon: 'fa-hand-holding-usd', 
      color: '#00cec9'
    },
    { 
      label: 'Level Income', 
      value: memberInfo?.levelIncome || '0', 
      icon: 'fa-sitemap', 
      color: '#9b59b6'
    },
    { 
      label: 'Repurchase Income', 
      value: memberInfo?.repurchaseIncome || '0', 
      icon: 'fa-wallet', 
      color: '#00cec9'
    }
  ];

  const leaderboardTabs = [
    { key: 'top', label: 'Top Earner', title: 'Top Earner' },
    { key: 'monthly', label: 'Monthly Top Earner', title: 'Monthly Top Earner' },
    { key: 'daily', label: 'Daily Top Earner', title: 'Daily Top Earner' },
    { key: 'rewards', label: 'Rewards', title: 'Rewards' }
  ];

  return (
    <div className="user-dashboard-shell">
      <main className="user-dashboard1-member-dashboard-root">
        {/* Top Profile Card */}
        <section className="user-dashboard1-member-dashboard-header">
          <div className="user-dashboard1-member-dashboard-profile-card">
            <div className="user-dashboard1-member-dashboard-profile-info">
              <div className="user-dashboard1-member-dashboard-profile-name">{memberInfo?.name || 'Member Name'}</div>
              <div className="user-dashboard1-member-dashboard-profile-meta">MEMBER ID : {memberInfo?.memberId || '---'} | REGISTER DATE : {memberInfo?.registeredAt ? formatDate(memberInfo.registeredAt) : '---'}</div>
            </div>
          </div>
          <div className="user-dashboard1-member-dashboard-actions">
            <button className="user-dashboard1-member-dashboard-action-btn user-dashboard1-member-dashboard-buy">UPGRADE ID</button>
            <button
              className="user-dashboard1-member-dashboard-action-btn user-dashboard1-member-dashboard-join"
              onClick={() => {
                const mid = memberInfo?.memberId;
                if (!mid) return;
                navigate(`/registration?ref=${encodeURIComponent(mid)}`);
              }}
            >
              JOIN NOW
            </button>
            <button
              className="user-dashboard1-member-dashboard-action-btn user-dashboard1-member-dashboard-share"
              onClick={async () => {
                const mid = memberInfo?.memberId;
                if (!mid) return;
                const url = `${window.location.origin}/registration?ref=${encodeURIComponent(mid)}`;
                const title = 'Join me on Elcon';
                const text = `Join me using my member ID ${mid} — Register here:`;
                if (navigator.share) {
                  try { await navigator.share({ title, text, url }); return; } catch (err) {}
                }
                try {
                  await navigator.clipboard.writeText(url);
                  const wa = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                  window.open(wa, '_blank', 'noopener,noreferrer');
                  alert('Share link copied to clipboard. WhatsApp share opened.');
                } catch (err) {
                  const mailto = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + ' ' + url)}`;
                  window.open(mailto, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              SHARE LINK
            </button>
          </div>
        </section>

        {/* Income Summary Cards */}
        <div className="income-summary-grid">
          {stats.map((stat, idx) => (
            <div className="income-summary-card" key={idx}>
              <div className="income-card-main-content">
                <div className="income-card-left">
                  <div className="income-card-label">{stat.label}</div>
                  <div className="income-card-value">
                    {String(stat.value).includes('₹') || isNaN(stat.value) || stat.value === '---' ? stat.value : `₹ ${Number(stat.value).toLocaleString('en-IN')}`}
                  </div>
                </div>
                <div className="income-card-icon" style={{ color: stat.color, borderColor: stat.color }}>
                  <i className={`fas ${stat.icon}`}></i>
                </div>
            </div>
          ))}
        </div>

        {/* Shortcut Boxes Section */}
        <div className="custom-boxes-container">
          <Link to="/user/donations/recieved-help" className="custom-box-new">
            <div className="custom-box-left">
              <div className="custom-box-indicator" style={{ backgroundColor: '#2ecc71' }}></div>
              <div className="custom-box-content">
                <div className="custom-box-value">{memberInfo?.receivedHelp || '0'}</div>
                <div className="custom-box-label">Received Help</div>
              </div>
            </div>
            <div className="custom-box-right">
              <i className="fas fa-circle-notch"></i>
            </div>
          </Link>

          <Link to="/user/donations/given-help" className="custom-box-new">
            <div className="custom-box-left">
              <div className="custom-box-indicator" style={{ backgroundColor: '#e83e8c' }}></div>
              <div className="custom-box-content">
                <div className="custom-box-value">{memberInfo?.givenHelp || '0'}</div>
                <div className="custom-box-label">Given Help</div>
              </div>
            </div>
            <div className="custom-box-right">
              <i className="fas fa-circle-notch"></i>
            </div>
          </Link>

          <Link to="/user/income-report/donations-income" className="custom-box-new">
            <div className="custom-box-left">
              <div className="custom-box-indicator" style={{ backgroundColor: '#fd7e14' }}></div>
              <div className="custom-box-content">
                <div className="custom-box-value">---</div>
                <div className="custom-box-label">Donation Report</div>
              </div>
            </div>
            <div className="custom-box-right">
              <i className="fas fa-circle-notch"></i>
            </div>
          </Link>

          <div className="custom-box-new" style={{ cursor: 'pointer' }}>
            <div className="custom-box-left">
              <div className="custom-box-indicator" style={{ backgroundColor: '#0dcaf0' }}></div>
              <div className="custom-box-content">
                <div className="custom-box-value">₹ 0</div>
                <div className="custom-box-label">Daily Income</div>
              </div>
            </div>
            <div className="custom-box-right">
              <i className="fas fa-circle-notch"></i>
            </div>
          </div>
        </div>

        {/* News Bar */}
        <div className="user-dashboard-news-bar-new">
          <div className="news-label-new">News</div>
          <div className="news-marquee-new">
            <marquee>
              {newsList.length > 0 
                ? newsList.map(n => n.title + (n.description ? ` - ${n.description}` : '')).join('  |  ') 
                : 'KYC is mandatory! Complete your KYC to receive payouts.'}
            </marquee>
          </div>
        </div>

        {/* Pending Package Alert */}
        {memberInfo?.joiningPackageDeliveryStatus === 'Pending' && memberInfo?.joiningPackageDeliveryCode && (
          <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Joining Package Delivery Pending</strong>
              <div style={{ fontSize: '0.9em', marginTop: '5px' }}>Please provide this code to your E-Pin Franchise Member to receive your Joining Package.</div>
            </div>
            <div style={{ background: '#fff', padding: '10px 20px', borderRadius: '4px', border: '2px dashed #f39c12', fontSize: '1.5em', fontWeight: 'bold', letterSpacing: '2px', color: '#f39c12' }}>
              {memberInfo.joiningPackageDeliveryCode}
            </div>
          </div>
        )}

            <section className="user-dashboard1-member-dashboard-table-section" style={{ marginTop: 0, marginBottom: '20px' }}>
              <div className="user-dashboard1-member-dashboard-table-tabs" role="tablist" aria-label="Earner Categories">
                {leaderboardTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    className={`user-dashboard1-member-dashboard-tab-btn ${activeTab === tab.key ? 'user-dashboard1-member-dashboard-tab-btn-active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="table-wrap">
                <table className="data-table" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th>S.NO</th>
                      <th>MEMBER ID</th>
                      <th>MEMBER NAME</th>
                      <th>AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab === 'rewards' ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', color: '#999' }}>Rewards coming soon</td></tr>
                    ) : loadingTopEarners ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', color: '#999' }}>Loading...</td></tr>
                    ) : topEarners.length > 0 ? (
                      topEarners.map((row, idx) => (
                        <tr key={`${idx}-${row.memberId}`}>
                          <td>{idx + 1}</td>
                          <td>{row.memberId || '---'}</td>
                          <td>{row.name || '---'}</td>
                          <td>₹ {Number(row.amount || 0).toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" style={{ textAlign: 'center', color: '#999' }}>No data available</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
            
            <div className="dashboard-hotkeys-grid">
              <button className="hotkey-btn bg-cyan">UPGRADE NOW</button>
              <button className="hotkey-btn bg-yellow">RECEIVED HELP</button>
              <button className="hotkey-btn bg-pink">DONATION REPORT</button>
              <button className="hotkey-btn bg-orange">GIVEN HELP</button>
            </div>

        <div className="user-dashboard-bottom-spacer" />
      </main>

      {activePopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#121a2f', border: '1px solid #00e5ff', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '90%', position: 'relative', boxShadow: '0 0 20px rgba(0,229,255,0.3)' }}>
            <button 
              onClick={() => setActivePopup(null)} 
              style={{ position: 'absolute', top: '10px', right: '15px', background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}
            >&times;</button>
            <h3 style={{ color: '#00e5ff', marginTop: 0, marginBottom: '16px', fontSize: '20px' }}>{activePopup.title}</h3>
            <p style={{ color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>{activePopup.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberDashboard;
