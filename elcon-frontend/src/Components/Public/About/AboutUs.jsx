import PublicPageHeader from '../Common/PublicPageHeader';
import './AboutUs.css';

function AboutUs() {
  return (
    <div>
      <PublicPageHeader title="Organization Information" />
      <section className="public-page">
        <div className="public-container about-content">
          <h3>Organization Registration Number: DI -210/49/2007-08 Under:Ges Government Of India</h3>
          <p className="about-kicker">Elcon Network System</p>
          <h2>Our Mission</h2>
          <p>
            Our organization has made a small effort to strengthen every section of the society directly
            through the internet. In this effort every person should help the needy persons with his will.
            It is the effort of our organization that by connecting every needy brothers and sisters in every
            village in every house we will try our best to end the huge problem of unemployment.
          </p>
          <p>
            By joining us, we work together to solve real-life financial problems and support each other with
            transparent and simple participation.
          </p>
          <p className="about-thanks">Thank You</p>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
