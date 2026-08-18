import PublicPageHeader from '../Common/PublicPageHeader';
import './HelpingProcess.css';

function HelpingProcess() {
  return (
    <div>
      <PublicPageHeader title="Helping Process" />
      <section className="public-page">
        <div className="public-container helping-wrap">
          <h2>Helping Process</h2>

          <div className="helping-board">
            <h3>Give Help By You</h3>
            <div className="helping-grid">
              <div>Help Amount</div>
              <div>No Of Person</div>
              <div>Total</div>
              <strong>Rs.50</strong>
              <strong>11 Person</strong>
              <strong>550</strong>
            </div>
            <p>This helping amount gives one time.</p>
          </div>

          <div className="helping-board">
            <h3>Help For You By System</h3>
            <div className="helping-grid helping-green">
              <div>Total Member</div>
              <div>Income Per Person</div>
              <div>Total Income</div>
              <strong>1398100</strong>
              <strong>50</strong>
              <strong>Rs.6,99,05,000</strong>
            </div>
            <p>4*10 automatic magical helping system.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HelpingProcess;
