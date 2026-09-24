import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../Common/UserLayout.css';
import './UserDashboard.css';
import { getUserDashboard, getTopEarners } from '../../../api/dashboardService';
import { getNewsPopupList } from '../../../api/managementService';
import { formatDate } from '../../../utils/dateFormatter';
import Swal from 'sweetalert2';

function MemberDashboard() {
  const [activeTab, setActiveTab] = useState('top');
  const [memberInfo, setMemberInfo] = useState(null);
  const [topEarners, setTopEarners] = useState([]);
  const [loadingTopEarners, setLoadingTopEarners] = useState(false);
  const [newsList, setNewsList] = useState([]);
  const [showAllTopEarners, setShowAllTopEarners] = useState(false);
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
          const published = response.items.filter(item => item.status === 'Published');
          
          // Only show news that are meant for Member panel
          const memberNews = published.filter(item => 
            (item.displayOn === 'Member panel' || item.displayOn === 'All') &&
            (item.type === 'News and Event' || item.type === 'News')
          );
          setNewsList(memberNews);

          // Popups show everywhere if showAsPopup is true
          const popups = published.filter(i => i.showAsPopup === true);
          if (popups.length > 0) {
            // Show the most recent item as popup on every refresh using SweetAlert2
            const latestPopup = popups[0];
            Swal.fire({
              title: latestPopup.title,
              text: latestPopup.description,
              icon: 'info',
              confirmButtonText: 'Close',
              customClass: {
                popup: 'swal2-popup'
              }
            });
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

  const formatAmount = (value) => {
    if (value === null || value === undefined || value === '' || value === '---') return '---';
    if (typeof value === 'string' && value.includes('₹')) return value;
    const amount = Number(String(value).replace(/[^0-9.-]/g, ''));
    return `₹ ${Number.isFinite(amount) ? amount.toLocaleString('en-IN') : '0'}`;
  };

  // Build stats array with real data where available
  const stats = [
    { label: 'Total Earning', value: memberInfo?.totalEarning || '---', recentLabel: 'Recent Total Income', recentValue: memberInfo?.yesterdayTotalIncome ?? memberInfo?.totalEarning ?? '---', icon: 'fa-wallet', color: '#00e5ff' },
    { label: 'Last Month Income', value: memberInfo?.lastMonthIncome || '---', icon: 'fa-calendar-check', color: '#2ecc71' },
    { label: 'Pending Help', value: memberInfo?.pendingHelp || '---', icon: 'fa-clock', color: '#f39c12', linkTo: '/user/donations/pending-help' },
    { label: 'Given Help', value: memberInfo?.givenHelp || '---', recentLabel: 'Recent Given Help', recentValue: memberInfo?.yesterdayGivenHelp ?? memberInfo?.givenHelp ?? '---', icon: 'fa-hand-holding-heart', color: '#e84393', linkTo: '/user/donations/given-help' },
    { label: 'Received Help', value: memberInfo?.receivedHelp || '---', recentLabel: 'Recent Received Help', recentValue: memberInfo?.yesterdayReceivedHelp ?? memberInfo?.receivedHelp ?? '---', icon: 'fa-hand-holding-usd', color: '#00cec9', linkTo: '/user/donations/recieved-help' },
    { label: 'Level Income', value: memberInfo?.levelIncome || '---', recentLabel: 'Recent Level Income', recentValue: memberInfo?.yesterdayLevelIncome ?? memberInfo?.levelIncome ?? '---', icon: 'fa-sitemap', color: '#9b59b6', linkTo: '/user/income-report/level-income' },
    { label: 'Repurchase Income', value: memberInfo?.repurchaseIncome || '---', recentLabel: 'Recent Repurchase Income', recentValue: memberInfo?.yesterdayRepurchaseIncome ?? memberInfo?.repurchaseIncome ?? '---', icon: 'fa-shopping-cart', color: '#1abc9c', linkTo: '/user/income-report/Repurchase-income' },
    { label: 'Total L + R Income', value: memberInfo?.totalLRIncome || '---', recentLabel: 'Recent L + R Income', recentValue: memberInfo?.yesterdayLRIncome ?? memberInfo?.totalLRIncome ?? '---', icon: 'fa-exchange-alt', color: '#f1c40f' },
    { label: 'Total Team', value: memberInfo?.totalTeam || '0', recentLabel: 'Recent Joining', recentValue: memberInfo?.yesterdayJoining || '0', icon: 'fa-users', color: '#00e5ff', isCurrency: false, linkTo: '/user/team/my-team' },
    { label: 'Unlock Level', value: memberInfo?.unlockLevel ?? '0', icon: 'fa-unlock', color: '#f39c12', isCurrency: false },
    { label: 'My Directs', value: memberInfo?.referralsCount || 0, icon: 'fa-user-friends', color: '#e84393', isCurrency: false, linkTo: '/user/team/direct-list' },
    { label: 'Upgraded Level', value: memberInfo?.upgradedLevel ?? '0', icon: 'fa-arrow-circle-up', color: '#3498db', isCurrency: false, linkTo: '/user/donations/given-help' },
    { label: 'Rank', value: memberInfo?.rank || '---', icon: 'fa-medal', color: '#f1c40f', isCurrency: false, linkTo: '/user/rank/my-rank' },
    { label: 'Wallet Balance', value: memberInfo?.walletBalance || 0, icon: 'fa-wallet', color: '#2ecc71', isCurrency: true, linkTo: '/user/transactions/transaction-history' },
    { label: 'Coupon Balance', value: memberInfo?.couponWalletBalance || 0, icon: 'fa-ticket-alt', color: '#9b59b6', isCurrency: true, linkTo: '/user/coupon/discount-wallet-statement' }
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
          {stats.map((stat, idx) => {
            const cardContent = (
              <div className="income-summary-card" key={idx}>
                <div className="income-card-content">
                  <div className="income-card-label" title={stat.label}>{stat.label}</div>
                  <div className="income-card-value" title={stat.isCurrency === false ? stat.value : formatAmount(stat.value)}>
                    {stat.isCurrency === false ? stat.value : formatAmount(stat.value)}
                  </div>
                </div>
                <div className="income-card-icon" style={{ color: stat.color, borderColor: `${stat.color}40`, backgroundColor: `${stat.color}15` }}>
                  <i className={`fas ${stat.icon}`}></i>
                </div>
                {stat.recentLabel && (
                  <div className="income-card-recent" title={`${stat.recentLabel} ${stat.isCurrency === false ? stat.recentValue : formatAmount(stat.recentValue)}`}>
                    {`${stat.recentLabel} ${stat.isCurrency === false ? stat.recentValue : formatAmount(stat.recentValue)}`}
                  </div>
                )}
              </div>
            );

            return stat.linkTo ? (
              <Link to={stat.linkTo} key={idx} style={{ textDecoration: 'none' }}>
                {cardContent}
              </Link>
            ) : (
              <React.Fragment key={idx}>
                {cardContent}
              </React.Fragment>
            );
          })}
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
            <div className="custom-box-recent" title={`Recent Received Help ${formatAmount(memberInfo?.yesterdayReceivedHelp ?? memberInfo?.receivedHelp ?? 0)}`}>
              {`Recent Received Help ${formatAmount(memberInfo?.yesterdayReceivedHelp ?? memberInfo?.receivedHelp ?? 0)}`}
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
            <div className="custom-box-recent" title={`Recent Given Help ${formatAmount(memberInfo?.yesterdayGivenHelp ?? memberInfo?.givenHelp ?? 0)}`}>
              {`Recent Given Help ${formatAmount(memberInfo?.yesterdayGivenHelp ?? memberInfo?.givenHelp ?? 0)}`}
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

        {/* Level Progress Report */}
        <section className="level-progress-container">
          <h3 className="level-progress-title">
            Upgrade Level Progress
          </h3>
          {(memberInfo?.levelProgress || Array.from({ length: 10 }, (_, i) => ({ level: i + 1, total: 0, upgraded: 0 }))).map(data => {
            const level = data.level;
            const totalMembers = data.total;
            const upgradedMembers = data.upgraded;
            const percent = totalMembers > 0 ? Math.floor((upgradedMembers / totalMembers) * 100) : 0;
            
            return (
              <div className="level-progress-row" key={level}>
                <div className="level-progress-details">
                  <div className="level-progress-header">
                    <span>Level {level} Progress</span>
                    <strong>{upgradedMembers} / {totalMembers}</strong>
                  </div>
                  <div className="level-progress-bar-bg">
                    <div 
                      className="level-progress-bar-fill" 
                      style={{ 
                        width: `${percent}%`, 
                        backgroundColor: percent === 100 && totalMembers > 0 ? '#2ecc71' : (percent > 0 ? '#00e5ff' : 'transparent') 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="level-progress-percentage">{percent}%</div>
              </div>
            );
          })}
        </section>
        {memberInfo?.showTopEarners !== false && (
          <section className="user-dashboard1-member-dashboard-table-section" style={{ marginTop: 0, marginBottom: '20px' }}>
            <div className="user-dashboard1-member-dashboard-table-tabs" role="tablist" aria-label="Earner Categories">
                  {leaderboardTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab.key}
                      className={`user-dashboard1-member-dashboard-tab-btn ${activeTab === tab.key ? 'user-dashboard1-member-dashboard-tab-btn-active' : ''}`}
                      onClick={() => {
                        setActiveTab(tab.key);
                        setShowAllTopEarners(false);
                      }}
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
                        (showAllTopEarners ? topEarners : topEarners.slice(0, 3)).map((row, idx) => (
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
                  {topEarners.length > 3 && activeTab !== 'rewards' && (
                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                      <button 
                        onClick={() => setShowAllTopEarners(!showAllTopEarners)}
                        style={{
                          background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 20px',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 15px rgba(0, 114, 255, 0.3)'
                        }}
                      >
                        {showAllTopEarners ? 'View Less' : 'View Full List'}
                      </button>
                    </div>
                  )}
                </div>
              </section>
        )}

        <div className="user-dashboard-bottom-spacer" />
      </main>

    </div>
  );
}

export default MemberDashboard;
