import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './PublicLayout.css';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about-us' },
  { label: 'Helping Process', to: '/helping-process' },
  { label: 'Our Activity', to: '/our-activity' },
  { label: 'Contact', to: '/contact' }
];

function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className={`public-root ${isMenuOpen ? 'public-menu-open' : 'public-menu-closed'}`}>

      <header className={`public-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="public-container public-header-inner">
          <NavLink to="/" className="public-logo-wrap">
            <div className="public-logo-mark">ELCON</div>
            <div className="public-logo-text">Elcon Network</div>
          </NavLink>

          <button
            type="button"
            className="public-menu-btn"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>

          <nav className="public-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `public-nav-link ${isActive ? 'active' : ''}`}
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="public-auth-btns">
            <NavLink to="/user-login" className="public-auth-btn btn-primary">
              Login
            </NavLink>
            <NavLink to="/registration" className="public-auth-btn btn-secondary">
              Registration
            </NavLink>
          </div>
        </div>
      </header>

      <aside className="public-mobile-sidebar">
        <nav className="public-mobile-nav">
          {navItems.map((item) => (
            <NavLink
              key={`mobile-${item.to}`}
              to={item.to}
              className={({ isActive }) => `public-mobile-link ${isActive ? 'active' : ''}`}
              end={item.to === '/'}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="public-mobile-auth">
          <NavLink to="/user-login" className="public-auth-btn btn-primary" onClick={closeMenu}>
            Login
          </NavLink>
          <NavLink to="/registration" className="public-auth-btn btn-secondary" onClick={closeMenu}>
            Registration
          </NavLink>
        </div>
      </aside>

      <button
        type="button"
        className="public-mobile-overlay"
        aria-label="Close menu overlay"
        onClick={closeMenu}
      />
      <main>
        <Outlet />
      </main>

      <section className="public-cta-band">
        <div className="public-container public-cta-inner">
          <div className="public-cta-content">
            <p>Success Is Not Final, Failure Is Not Fatal :</p>
            <h3>It Is The Courage To Continue That Counts.</h3>
            <NavLink to="/registration" className="public-cta-btn">
              Registration
            </NavLink>
          </div>
          <div className="public-cta-image-placeholder">
            <img 
              src="/cta-img.png" 
              alt="CTA Hero" 
              style={{ width: '100%', height: 'auto', display: 'block' }} 
            />
          </div>
        </div>
      </section>

      <footer className="public-footer">
        <div className="public-container public-footer-grid">
          <div>
            <NavLink to="/" className="public-logo-wrap" style={{ display: 'flex', marginBottom: '20px' }}>
              <div className="public-logo-mark">ELCON</div>
              <div className="public-logo-text">Elcon Network</div>
            </NavLink>
            <p style={{ lineHeight: '1.7', color: '#c8d4de' }}>
              Elcon Network is a premier platform dedicated to empowering individuals through a transparent and robust network. 
              We provide the essential tools and resources to help you grow your business and achieve lasting success.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <h4>Navigation</h4>
              <p>› Home</p>
              <p>› Contact Us</p>
              <p>› Login</p>
              <p>› Registration</p>
            </div>
          </div>
          <div>
            <h4>Contact Us</h4>
            <div className="public-contact-item">
              <span className="public-icon-circle bg-orange">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </span>
              <p>support@elconnetwork.com</p>
            </div>
            <div className="public-contact-item">
              <span className="public-icon-circle bg-orange">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </span>
              <p>+91 8290777222</p>
            </div>
            <div className="public-contact-item">
              <span className="public-icon-circle bg-orange">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <p>123 Elcon Street, New Delhi, India</p>
            </div>
            
            <div className="public-footer-socials" aria-hidden="true">
              <span className="public-icon-circle bg-facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </span>
              <span className="public-icon-circle bg-twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </span>
              <span className="public-icon-circle bg-instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </span>
              <span className="public-icon-circle bg-youtube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              </span>
            </div>
          </div>
        </div>
      </footer>
      <div className="public-copyright">Copyright © 2026 Elcon Network. All Rights Reserved.</div>
    </div>
  );
}

export default PublicLayout;
