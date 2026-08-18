import React from 'react';
import ParticleSwarmBg from './ParticleSwarmBg';

function PublicPageHeader({ title }) {
  return (
    <section className="public-hero" style={{ position: 'relative', overflow: 'hidden' }}>
      <ParticleSwarmBg />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1>{title}</h1>
      </div>
    </section>
  );
}

export default PublicPageHeader;
