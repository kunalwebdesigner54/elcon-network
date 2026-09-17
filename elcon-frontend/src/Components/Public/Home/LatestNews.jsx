import React from 'react';
import './LatestNews.css';

function LatestNews() {
  const newsItems = [
    {
      title: "New Joining Packages Available",
      date: "15 Sep 2026",
      excerpt: "We are thrilled to announce new exciting joining packages with more benefits and rewards. Upgrade your tier today to maximize your potential!",
      img: "/gallery-bg.jpg"
    },
    {
      title: "Milestone Achievers Honored",
      date: "10 Sep 2026",
      excerpt: "Congratulations to all the hard-working individuals who have reached their milestones this month. Keep up the great work and dedication!",
      img: "/grow-bg.jpg"
    },
    {
      title: "Upcoming Leadership Seminar",
      date: "05 Sep 2026",
      excerpt: "Don't miss our exclusive leadership seminar this weekend. Learn top strategies from industry experts to grow your network rapidly.",
      img: "/feature-bg.jpg"
    }
  ];

  return (
    <section className="latest-news-section">
      <div className="public-container">
        <div className="pp-section-header text-center" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="pp-section-title" style={{ justifyContent: 'center' }}>
            <span className="pp-section-title-accent"></span>
            Latest News & Blogs
          </h2>
          <p style={{ color: '#9ca3af', marginTop: '10px' }}>Stay updated with our recent announcements and stories</p>
        </div>
        
        <div className="news-grid">
          {newsItems.map((news, index) => (
            <div className="news-card" key={index}>
              <div className="news-image-wrap">
                <img src={news.img} alt={news.title} className="news-image" />
                <div className="news-date-badge">
                  <span className="news-date-day">{news.date.split(' ')[0]}</span>
                  <span className="news-date-month">{news.date.split(' ')[1]}</span>
                </div>
              </div>
              <div className="news-content">
                <h3 className="news-title">{news.title}</h3>
                <p className="news-excerpt">{news.excerpt}</p>
                <button className="news-read-more" type="button">Read More <span>→</span></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LatestNews;
