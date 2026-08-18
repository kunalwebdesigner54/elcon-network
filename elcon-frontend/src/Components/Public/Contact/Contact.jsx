import PublicPageHeader from '../Common/PublicPageHeader';
import '../Home/Home.css';
import './Contact.css';

function Contact() {
  return (
    <div>
      <PublicPageHeader title="Contact" />
      <section className="public-page">
        
        {/* Contact Info Cards (3-steps style) */}
        <div className="home-steps-section contact-info-cards" style={{ padding: '0', background: 'transparent' }}>
          <div className="public-container home-steps-row">
            {/* Card 1 - Email */}
            <div className="step-aura">
              <div className="step-card" style={{ background: '#0b192c' }}>
                <div className="step-card-body">
                  <span className="step-badge step-badge-blue">Email Us</span>
                  <div className="step-card-header">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="float-3d-icon" style={{ color: '#60a5fa' }}>
                      <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                      <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                    </svg>
                    <h2 className="step-card-title">Email</h2>
                  </div>
                  <p className="step-desc" style={{ color: '#d1d5db', fontSize: '15px', lineHeight: '1.6', margin: '14px 0 0', flex: 1 }}>
                    support@elconnetwork.com
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 - Phone */}
            <div className="step-aura">
              <div className="step-card" style={{ background: '#0b192c' }}>
                <div className="step-card-body">
                  <span className="step-badge step-badge-orange">Call Us</span>
                  <div className="step-card-header">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="float-3d-icon" style={{ color: '#fbbf24' }}>
                      <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                    </svg>
                    <h2 className="step-card-title">Phone</h2>
                  </div>
                  <p className="step-desc" style={{ color: '#d1d5db', fontSize: '15px', lineHeight: '1.6', margin: '14px 0 0', flex: 1 }}>
                    +91 8290777222
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3 - Address */}
            <div className="step-aura">
              <div className="step-card" style={{ background: '#0b192c' }}>
                <div className="step-card-body">
                  <span className="step-badge step-badge-green">Visit Us</span>
                  <div className="step-card-header">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="float-3d-icon" style={{ color: '#34d399' }}>
                      <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    <h2 className="step-card-title">Address</h2>
                  </div>
                  <p className="step-desc" style={{ color: '#d1d5db', fontSize: '15px', lineHeight: '1.6', margin: '14px 0 0', flex: 1 }}>
                    123 Elcon Street, New Delhi, India
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="public-container contact-form-wrapper">
          <div className="contact-transparent-form">
            <h2>Get In Touch</h2>
            <div className="public-form-grid">
              <div className="public-form-field contact-full-row">
                <label>Full Name *</label>
                <input placeholder="Enter Full Name" />
              </div>
              <div className="public-form-field">
                <label>Mobile Number *</label>
                <input placeholder="Enter Mobile Number" />
              </div>
              <div className="public-form-field">
                <label>Email ID *</label>
                <input placeholder="Enter Email ID" />
              </div>
              <div className="public-form-field contact-full-row">
                <label>Message</label>
                <textarea placeholder="Enter Message" />
              </div>
            </div>
            <button type="button" className="btn-primary">
              Send Message
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
