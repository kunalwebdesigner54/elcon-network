import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Common/UserLayout.css';
import './UserDashboard.css';
import { getUserDashboard } from '../../../api/dashboardService';
import dashboard1 from '../../../Assets/Pictures/dashbaord1.jpeg';
import dashboard2 from '../../../Assets/Pictures/dashbaord2.jpeg';
import dashboard3 from '../../../Assets/Pictures/dashbaord3.jpeg';
import dashboard4 from '../../../Assets/Pictures/dashbaord4.jpeg';
import dashboard5 from '../../../Assets/Pictures/dashbaord5.jpeg';
import productPads from '../../../Assets/Pictures/pads.jpeg';
import productAirpods from '../../../Assets/Pictures/airpods.jpeg';

const bannerSlides = [dashboard1, dashboard2, dashboard3, dashboard4, dashboard5];

const productImages = [
  { src: productPads, name: 'Elcon Anion Sanitary Pads' },
  { src: productAirpods, name: 'Wireless Airpods' }
];

function MemberDashboard() {
  const [activeTab, setActiveTab] = useState('top');
  const [activeSlide, setActiveSlide] = useState(0);
  const [memberInfo, setMemberInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % bannerSlides.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await getUserDashboard();
        if (mounted && res?.success) setMemberInfo(res.data);
      } catch (err) {
        // ignore
      }
    };
    fetch();
    return () => (mounted = false);
  }, []);

  // Build stats array with real data where available
  const stats = [
    { label: 'Total Earning', value: memberInfo?.totalEarning || '---' },
    { label: 'Last Month Income', value: memberInfo?.lastMonthIncome || '---' },
    { label: 'Pending Help', value: memberInfo?.pendingHelp || '---' },
    { label: 'Given Help', value: memberInfo?.givenHelp || '---' },
    { label: 'Received Help', value: memberInfo?.receivedHelp || '---' },
    { label: "Yesterday's Received Help", value: memberInfo?.yesterdayReceivedHelp || '---' },
    { label: 'Level Income', value: memberInfo?.levelIncome || '---' },
    { label: "Yesterday's Level Income", value: memberInfo?.yesterdayLevelIncome || '---' },
    { label: 'Repurchase Income', value: memberInfo?.repurchaseIncome || '---' },
    { label: "Yesterday's Repurchase Income", value: memberInfo?.yesterdayRepurchaseIncome || '---' },
    { label: 'Total L + R Income', value: memberInfo?.totalLRIncome || '---' },
    { label: "Yesterday's Total Income", value: memberInfo?.yesterdayTotalIncome || '---' },
    { label: 'Total Team', value: memberInfo?.totalTeam || '---' },
    { label: "Yesterday's Joining", value: memberInfo?.yesterdayJoining || '---' },
    { label: 'Unlock Level', value: memberInfo?.unlockLevel || '---' },
    { label: 'My Directs', value: memberInfo?.referralsCount || 0 },
    { label: 'Upgraded Level', value: memberInfo?.upgradedLevel || '---' },
    { label: 'Rank', value: memberInfo?.rank || '---' }
  ];

  const leaderboardTabs = [
    { key: 'top', label: 'Top Earner', title: 'Top Earner' },
    { key: 'monthly', label: 'Monthly Top Earner', title: 'Monthly Top Earner' },
    { key: 'daily', label: 'Daily Top Earner', title: 'Daily Top Earner' },
    { key: 'rewards', label: 'Rewards', title: 'Rewards' }
  ];

  const goToPreviousSlide = () => {
    setActiveSlide((current) => (current - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const goToNextSlide = () => {
    setActiveSlide((current) => (current + 1) % bannerSlides.length);
  };

  return (
    <div className="user-dashboard-shell">
      <div className="user-dashboard1-member-dashboard-root">
     

       

        <section className="user-dashboard-carousel-card" aria-label="Dashboard banner carousel">
          <div className="user-dashboard-carousel-stage">
            <button type="button" className="user-dashboard-carousel-nav user-dashboard-carousel-nav-left" onClick={goToPreviousSlide} aria-label="Previous banner">
              ‹
            </button>
            <img src={bannerSlides[activeSlide]} alt={`Dashboard banner ${activeSlide + 1}`} className="user-dashboard-carousel-image" />
            <button type="button" className="user-dashboard-carousel-nav user-dashboard-carousel-nav-right" onClick={goToNextSlide} aria-label="Next banner">
              ›
            </button>
          </div>
          <div className="user-dashboard-carousel-dots" aria-label="Banner navigation dots">
            {bannerSlides.map((slide, index) => (
              <button
                key={slide}
                type="button"
                className={`user-dashboard-carousel-dot ${index === activeSlide ? 'is-active' : ''}`}
                onClick={() => setActiveSlide(index)}
                aria-label={`Show banner ${index + 1}`}
              />
            ))}
          </div>
        </section>

        <div className="user-dashboard-news-bar" role="status" aria-live="polite">
          <span className="user-dashboard-news-label"> NEWS</span>
          <div className="user-dashboard-news-track">
            <div className="user-dashboard-news-marquee">KYC is mandatory! Complete your KYC to receive payouts.</div>
          </div>
        </div>

        <section className="user-dashboard1-member-dashboard-header">
          <div className="user-dashboard1-member-dashboard-profile-card">
            <div className="user-dashboard1-member-dashboard-profile-info">
              <div className="user-dashboard1-member-dashboard-profile-name">{memberInfo?.name || 'Member Name'}</div>
              <div className="user-dashboard1-member-dashboard-profile-meta">MEMBER ID : {memberInfo?.memberId || '---'} | REGISTER DATE : {memberInfo?.registeredAt ? new Date(memberInfo.registeredAt).toLocaleDateString() : '---'}</div>
            </div>
          </div>
          <div className="user-dashboard1-member-dashboard-actions">
            <button className="user-dashboard1-member-dashboard-action-btn user-dashboard1-member-dashboard-buy">Buy Product</button>
            <button
              className="user-dashboard1-member-dashboard-action-btn user-dashboard1-member-dashboard-join"
              onClick={() => {
                const mid = memberInfo?.memberId;
                if (!mid) return;
                navigate(`/registration?ref=${encodeURIComponent(mid)}`);
              }}
            >
              Join Now
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
                  try {
                    await navigator.share({ title, text, url });
                    return;
                  } catch (err) {
                    // fallthrough to copy
                  }
                }

                try {
                  await navigator.clipboard.writeText(url);
                  // open whatsapp share as a convenient fallback
                  const wa = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                  window.open(wa, '_blank', 'noopener,noreferrer');
                  alert('Share link copied to clipboard. WhatsApp share opened.');
                } catch (err) {
                  // final fallback: open mailto
                  const mailto = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + ' ' + url)}`;
                  window.open(mailto, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              Share Link
            </button>
          </div>
        </section>

        <div className="user-dashboard1-member-dashboard-stats-grid">
          {stats.map((stat) => (
            <div className="user-dashboard1-member-dashboard-stat-card" key={stat.label}>
              <div className="user-dashboard1-member-dashboard-stat-content">
                <div className="user-dashboard1-member-dashboard-stat-label">{stat.label}</div>
                <div className="user-dashboard1-member-dashboard-stat-value">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        <section className="user-dashboard1-member-dashboard-table-section">
          <div className="user-dashboard1-member-dashboard-table-title">🏆 {leaderboardTabs.find((tab) => tab.key === activeTab)?.title || 'Top Earner'}</div>
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
          <div className="user-dashboard1-member-dashboard-table-wrap">
            <table className="user-dashboard1-member-dashboard-table">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>MEMBER ID</th>
                  <th>MEMBER NAME</th>
                  <th>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {activeTab === 'top' && (memberInfo?.recentReferrals || []).length > 0 ? (
                  memberInfo.recentReferrals.map((row, idx) => (
                    <tr key={row._id || `${idx}-${row.memberId}`}>
                      <td>{idx + 1}</td>
                      <td>{row.memberId || '---'}</td>
                      <td>{row.name || '---'}</td>
                      <td>---</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#999' }}>No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="user-dashboard1-member-dashboard-products-section">
          <div className="user-dashboard1-member-dashboard-products-title">📦 Featured Products</div>
          <div className="user-dashboard1-member-dashboard-products-grid">
            {productImages.map((img, idx) => (
              <div className="user-dashboard1-member-dashboard-product-card" key={idx}>
                <img src={img.src} alt={img.name} />
                <div className="user-dashboard1-member-dashboard-product-name">{img.name}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="user-dashboard-bottom-spacer" />
      </div>
    </div>
  );
}

export default MemberDashboard;