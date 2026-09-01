import { useState, useEffect } from 'react';
import { getProfile } from '../../../../api/authService';
import './WelcomeLetter.css';

function WelcomeLetter() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then((res) => setProfile(res.data))
      .catch((err) => console.error('Failed to load profile for welcome letter', err))
      .finally(() => setLoading(false));
  }, []);

  const printLetter = () => {
    window.print();
  };

  if (loading) return <div>Loading Welcome Letter...</div>;
  if (!profile) return <div>Failed to load data.</div>;

  const joinDateStr = profile.createdAt 
    ? new Date(profile.createdAt).toLocaleString('en-IN', { hour12: true })
    : '---';

  const fullAddress = [profile.address, profile.city, profile.state, profile.pincode]
    .filter(Boolean)
    .join(', ') || '---';

  return (
    <section className="welcome-letter-page">
      <article className="welcome-letter-sheet" aria-label="welcome-letter-sheet">
        <div className="welcome-letter-frame">
          <h2 className="welcome-letter-title" style={{ color: '#000' }}>CONGRATULATION !</h2>

          <p className="welcome-letter-joining-date">
            <strong>Joining Date :</strong> {joinDateStr}
          </p>

          <p className="welcome-letter-member-line">
            <strong>{profile.name}</strong>
            <br />
            [{profile.memberId}]
            <br />
            {fullAddress}
          </p>

          <p>
            Dear <strong>{profile.name}</strong>,
          </p>

          <p>
            As a new family member of <strong>Elcon Network</strong>, we are pleased to extend a warm
            and healthy welcome to you at <strong>Elcon Network.</strong>
          </p>

          <p>
            We wish you the very best of luck and look forward to building a long-term relationship
            with you. We are truly delighted to have you join us. Your contribution is valuable and
            will play an important role in our continued success and growth.
          </p>

          <p>
            We assure you that you will receive maximum support from our entire team, and we look
            forward to building a strong and positive relationship together.
          </p>

          <p>At Elcon, we proudly say - we have a TEAM, a PLAN, and a SYSTEM that WORKS</p>

          <p>
            For better communication and excellent service, we kindly request you to share your
            valuable suggestions and feedback with us.
          </p>

          <p>
            Once again, welcome to the Elcon family. We wish you great success in your journey with
            us.
          </p>

          <p className="welcome-letter-signoff">
            Warm Regards,
            <br />
            <strong>Elcon Network Team</strong>
          </p>

          <div className="welcome-letter-table-wrap">
            <table className="welcome-letter-table">
              <thead>
                <tr>
                  <th>Sponsor ID</th>
                  <th>Member ID</th>
                  <th>Member Name</th>
                  <th>Joining Date &amp; Time</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ color: '#000' }}>
                  <td style={{ color: '#000' }}>{profile.sponsorId || '---'}</td>
                  <td style={{ color: '#000' }}>{profile.memberId}</td>
                  <td style={{ color: '#000' }}>{profile.name}</td>
                  <td style={{ color: '#000' }}>{joinDateStr}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="welcome-letter-footnote">
            (This Is Computer Generated And Does Not Require Any Signatures.)
          </p>
        </div>
      </article>

      <button type="button" className="welcome-letter-print-btn" onClick={printLetter}>
        Print
      </button>
    </section>
  );
}

export default WelcomeLetter;
