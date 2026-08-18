import PublicPageHeader from '../Common/PublicPageHeader';
import './HelpingProcess.css';

function HelpingProcess() {
  return (
    <div>
      <PublicPageHeader title="Helping Process" />
      <section className="public-page about-section-bg">
        <div className="public-container helping-content-wrapper">
          <div className="helping-image-side">
            <img src="/mission-img.png" alt="Helping Process" className="helping-image" />
          </div>
          
          <div className="helping-text-side">
            <h2>Helping Process</h2>

            <div className="helping-board">
              <h3>Give Help By You</h3>
              <table className="beautiful-table">
                <thead>
                  <tr>
                    <th>Help Amount</th>
                    <th>No Of Person</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="highlight-green">Rs.50</td>
                    <td className="highlight-green">11 Person</td>
                    <td className="highlight-green">550</td>
                  </tr>
                </tbody>
              </table>
              <p>This helping amount gives one time.</p>
            </div>

            <div className="helping-board">
              <h3>Help For You By System</h3>
              <table className="beautiful-table">
                <thead>
                  <tr>
                    <th>Total Member</th>
                    <th>Income Per Person</th>
                    <th>Total Income</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="highlight-green">1398100</td>
                    <td className="highlight-green">50</td>
                    <td className="highlight-green">Rs.6,99,05,000</td>
                  </tr>
                </tbody>
              </table>
              <p>4*10 automatic magical helping system.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HelpingProcess;
