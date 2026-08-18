import { useEffect, useRef } from 'react';
import './Home.css';
import ParticleSwarm from './ParticleSwarm';
import MagneticCarousel from './MagneticCarousel';

function Home() {
  const bannerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (bannerRef.current) {
        bannerRef.current.classList.add('banner-text-clear');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div>
      <section className="home-banner">
        <ParticleSwarm />
        <div className="public-container home-banner-inner">
          <div className="home-banner-content" ref={bannerRef}>
            <p className="home-banner-kicker">Welcome To</p>
            <h1 className="home-banner-title">Elcon Network</h1>
            <p className="home-banner-desc">
              This platform has been started because in this time many people business have small speed and
              many people jobs have less income. A small dose of yours by joining this system can help many
              families.
            </p>
          </div>
          <div className="home-banner-img-wrap">
            <img src="/banner-img.png" alt="Elcon Network" className="home-banner-img" />
          </div>
        </div>
      </section>

      <section className="home-steps-section">
        <div className="public-container home-steps-row">

          {/* Card 1 - Register */}
          <div className="step-aura">
            <div className="step-card">
              <div className="step-card-body">
                <span className="step-badge step-badge-blue">Step 1</span>
                <div className="step-card-header">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="float-3d-icon" style={{ color: '#60a5fa' }}>
                    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                  </svg>
                  <h2 className="step-card-title">Register</h2>
                </div>
                <p className="step-desc" style={{ color: '#d1d5db', fontSize: '15px', lineHeight: '1.6', margin: '14px 0 0', flex: 1 }}>
                  Choose your favorite plan and join with profit steps.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 - Invite Friends */}
          <div className="step-aura">
            <div className="step-card">
              <div className="step-card-body">
                <span className="step-badge step-badge-orange">Step 2</span>
                <div className="step-card-header">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="float-3d-icon" style={{ color: '#fbbf24' }}>
                    <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
                    <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 016.576-1.99 6.74 6.74 0 01-3.006-2.057zM19.226 19.389a8.286 8.286 0 00-1.308-5.135 6.74 6.74 0 01-3.006 2.057 3.75 3.75 0 016.576 1.99l-.01.121a.563.563 0 01-.373.486l-.115.04c-.56.195-1.15.349-1.764.441z" />
                  </svg>
                  <h2 className="step-card-title">Invite Friends</h2>
                </div>
                <p className="step-desc" style={{ color: '#d1d5db', fontSize: '15px', lineHeight: '1.6', margin: '14px 0 0', flex: 1 }}>
                  Expand your plan and earn money with your friends.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3 - Success */}
          <div className="step-aura">
            <div className="step-card">
              <div className="step-card-body">
                <span className="step-badge step-badge-green">Step 3</span>
                <div className="step-card-header">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="float-3d-icon" style={{ color: '#34d399' }}>
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005z" clipRule="evenodd" />
                  </svg>
                  <h2 className="step-card-title">Success</h2>
                </div>
                <p className="step-desc" style={{ color: '#d1d5db', fontSize: '15px', lineHeight: '1.6', margin: '14px 0 0', flex: 1 }}>
                  Get rewards with successful milestone achievement.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Block Section */}
      <section className="home-feature-section">
        <div className="public-container home-feature-block">
          <div className="home-feature-img-wrap">
            <img src="/about-img.png" alt="Grow Your Network" className="home-feature-img" />
          </div>
          <div className="home-feature-text">
            <h2>Grow Your Network</h2>
            <p>
              Experience the best platform to expand your connections and build a solid foundation for your financial goals. Our intuitive tools make it simple to monitor progress, invite others, and earn regular rewards.
            </p>
            <p style={{ marginTop: '15px' }}>
              We provide you with all the necessary resources and community support to help you scale faster. Whether you are a beginner or a seasoned professional, our system is designed to seamlessly integrate into your daily workflow, unlocking new opportunities for limitless growth and success. Join us today and take the first step towards a brighter financial future!
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="home-gallery-section">
        <div className="public-container">
          <div className="home-gallery-header">
            <h2>Gallery</h2>
            <p>A glimpse into our successful events and growing community.</p>
          </div>
          <div style={{ marginTop: '50px', height: '500px' }}>
            <MagneticCarousel />
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
