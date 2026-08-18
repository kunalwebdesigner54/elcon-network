import './WelcomeLetter.css';

const letterData = {
  joiningDate: '23-11-2024 12:57:37PM',
  memberName: 'Nishikant Kailas Shirke',
  memberId: 'EL12345678',
  address: 'A-201, Oxford Paradise, Vidya Valley School Road Susgaon Pune - 411021',
  sponsorId: 'EL12345678',
  joiningMemberId: 'EL12345100'
};

function WelcomeLetter() {
  const printLetter = () => {
    window.print();
  };

  return (
    <section className="welcome-letter-page">
      <article className="welcome-letter-sheet" aria-label="welcome-letter-sheet">
        <div className="welcome-letter-frame">
          <h2 className="welcome-letter-title">CONGRATULATION !</h2>

          <p className="welcome-letter-joining-date">
            <strong>Joining Date :</strong> {letterData.joiningDate}
          </p>

          <p className="welcome-letter-member-line">
            <strong>{letterData.memberName}</strong>
            <br />
            [{letterData.memberId}]
            <br />
            {letterData.address}
          </p>

          <p>
            Dear <strong>{letterData.memberName}</strong>,
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
                <tr>
                  <td>{letterData.sponsorId}</td>
                  <td>{letterData.joiningMemberId}</td>
                  <td>{letterData.memberName}</td>
                  <td>{letterData.joiningDate.toLowerCase()}</td>
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