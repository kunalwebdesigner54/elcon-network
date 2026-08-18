import PublicPageHeader from '../Common/PublicPageHeader';
import './Contact.css';

function Contact() {
  return (
    <div>
      <PublicPageHeader title="Contact" />
      <section className="public-page">
        <div className="public-container contact-grid">
          <div className="public-white-card">
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
            <button type="button" className="public-primary-btn">
              Send Message
            </button>
          </div>

          <div className="public-white-card contact-info-card">
            <h2>Contact Info</h2>
            <div className="contact-item">
              <span>✉</span>
              <div>
                <h4>Email</h4>
                <p>support@elconnetwork.com</p>
              </div>
            </div>
            <div className="contact-item">
              <span>◔</span>
              <div>
                <h4>Whatsapp SMS</h4>
                <p>8290777222</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
