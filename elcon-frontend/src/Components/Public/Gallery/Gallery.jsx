import PublicPageHeader from '../Common/PublicPageHeader';
import './Gallery.css';

function Gallery() {
  return (
    <div>
      <PublicPageHeader title="Gallery" />
      <section className="public-page">
        <div className="public-container gallery-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="gallery-item" />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Gallery;
