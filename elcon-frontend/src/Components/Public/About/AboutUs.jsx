import PublicPageHeader from '../Common/PublicPageHeader';
import './AboutUs.css';

const activities = [
  {
    title: "Women Empowerment",
    description: "The Women Empowerment program is conducted to make women self-reliant and confident. Under this program, education, skill training, and guidance are provided to women. Self-employment and financial support may also be given when required. All support is provided based on available donations and the rules of the organization. The aim of the organization is to empower women socially and economically.",
    image: "/ngo/women-empowerment.jpg"
  },
  {
    title: "Food Distribution",
    description: "Food is a basic necessity of every human being. Many poor, needy, orphan, elderly, sick, disabled, and disaster-affected people do not get enough food every day. To help such people, our organization runs a social activity called Food Distribution Service. Under this program, free food, grains, fruits, water, cooked meals, and essential items are distributed to needy people.",
    image: "/ngo/food-distribution.jpg"
  },
  {
    title: "Education Support",
    description: "Education is a fundamental right of every student, but economically weaker students often face difficulty in continuing their education. The organization runs the Education Support Program to support such students. Under this program, fee support, study materials, scholarships, and guidance are provided. Support is given based on donations and the rules of the organization. The aim is to ensure that no student is deprived of education due to financial problems.",
    image: "/ngo/education-support.jpg"
  },
  {
    title: "Helping the Poor",
    description: "The organization runs the Helping the Poor program to support needy and poor people in society. Under this program, food, clothes, medicines, and essential items are provided. Financial help and necessary guidance may also be given when required. All support is provided based on available donations and the rules of the organization. The aim is to help improve the living conditions of needy people.",
    image: "/ngo/helping-poor.jpg"
  },
  {
    title: "Healthcare Camps",
    description: "Healthcare Camps are organized to provide medical services to needy and economically weaker people. Free health checkups, medicines, and medical guidance are provided in these camps. Expert doctor consultation and treatment support are arranged when required. All support is provided based on available donations and the rules of the organization. The aim is to help improve the health of people in society.",
    image: "/ngo/healthcare-camps.jpg"
  },
  {
    title: "Elder Care",
    description: "The Elder Care program is conducted to support senior citizens in society. Under this program, food, medicines, clothes, and essential items are provided. Medical help and care support are arranged when required. All support is provided based on available donations and the rules of the organization. The aim is to help senior citizens live safely and with dignity.",
    image: "/ngo/elder-care.jpg"
  }
];

function AboutUs() {
  return (
    <div>
      <PublicPageHeader title="Elcon Foundation" />
      <section className="public-page about-section-bg">
        <div className="public-container about-content-wrapper">
          <div className="about-image-side">
            <img src="/mission-img.png" alt="Mission" className="about-image" />
          </div>
          <div className="about-text-side">
            <p className="about-kicker">Elcon Network System</p>
            <h2>Our Mission</h2>
            <h3>Organization Registration Number: DI -210/49/2007-08 Under:Ges Government Of India</h3>
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
        </div>
      </section>

      <section className="public-page activities-section">
        <div className="public-container">
          <h2 className="activities-title" style={{ textAlign: 'center', marginBottom: '40px', fontSize: '32px', color: '#1e293b' }}>OUR ACTIVITY</h2>
          <div className="activities-grid">
            {activities.map((activity, index) => (
              <div key={index} className="activity-card" style={{ display: 'flex', gap: '20px', marginBottom: '30px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', alignItems: 'center', flexDirection: index % 2 !== 0 ? 'row-reverse' : 'row' }}>
                <div className="activity-image-wrapper" style={{ flex: '0 0 40%' }}>
                  <img src={activity.image} alt={activity.title} style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#f1f5f9' }} />
                </div>
                <div className="activity-text" style={{ flex: '1' }}>
                  <h3 style={{ fontSize: '24px', marginBottom: '15px', color: '#0f172a' }}>{activity.title}</h3>
                  <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#475569' }}>{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
