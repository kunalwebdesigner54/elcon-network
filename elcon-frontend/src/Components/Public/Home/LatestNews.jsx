import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { getBlogList } from '../../../api/blogService';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './LatestNews.css';

function LatestNews() {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getBlogList()
      .then((res) => {
        if (res.success && res.items) {
          // Filter out drafts just in case, and sort by date
          const published = res.items.filter(item => item.status === 'Published');
          setNewsItems(published);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getMonthStr = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const monthIndex = parseInt(parts[1], 10) - 1;
      const date = new Date(parts[2], monthIndex, parts[0]);
      return date.toLocaleString('default', { month: 'short' });
    }
    return '';
  };

  const getDayStr = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) return parts[0];
    return '';
  };

  const sliderSettings = {
    dots: true,
    infinite: newsItems.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
    dotsClass: "slick-dots transparent-dots",
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          infinite: newsItems.length > 1
        }
      }
    ]
  };

  if (loading) return null;
  if (newsItems.length === 0) return null;

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
        
        <div className="news-slider-wrap">
          <Slider {...sliderSettings}>
            {newsItems.map((news, index) => (
              <div key={index} className="news-slide-item">
                <div className="news-card">
                  <div className="news-image-wrap">
                    <img 
                      src={news.images && news.images.length > 0 ? news.images[0] : '/feature-bg.jpg'} 
                      alt={news.title} 
                      className="news-image" 
                    />
                    <div className="news-date-badge">
                      <span className="news-date-day">{getDayStr(news.publishDate)}</span>
                      <span className="news-date-month">{getMonthStr(news.publishDate)}</span>
                    </div>
                  </div>
                  <div className="news-content">
                    <h3 className="news-title">{news.title}</h3>
                    <p className="news-excerpt">{news.description}</p>
                    <button className="news-read-more" type="button" onClick={() => navigate(`/blog/${news.id || news._id}`)}>
                      Read More <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}

export default LatestNews;
