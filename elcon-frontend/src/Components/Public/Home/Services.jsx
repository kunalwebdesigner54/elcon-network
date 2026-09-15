import React from 'react';
import './Services.css';

const servicesData = [
  {
    title: 'Constant Free Service',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae accusantium consectetur.',
    icon: 'fa-solid fa-medal'
  },
  {
    title: 'Social Media Promotion',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae accusantium consectetur.',
    icon: 'fa-solid fa-clapperboard'
  },
  {
    title: 'Website Design & Development',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae accusantium consectetur.',
    icon: 'fa-regular fa-lightbulb'
  },
  {
    title: 'Any time Customer support',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae accusantium consectetur.',
    icon: 'fa-solid fa-crown'
  }
];

function Services() {
  return (
    <section className="home-services-section">
      <div className="public-container">
        <div className="home-services-header">
          <h2>Our Services</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vitae risus nec dui venenatis
            dignissim. Aenean vitae metus in augue pretium ultrices.
          </p>
        </div>

        <div className="home-services-grid">
          {servicesData.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon-wrap">
                <i className={service.icon}></i>
              </div>
              <div className="service-card-content">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
