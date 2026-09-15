import PublicPageHeader from '../Common/PublicPageHeader';
import GridGallery from '../Home/GridGallery';
import './Gallery.css';

function Gallery() {
  return (
    <div>
      <PublicPageHeader title="Gallery" />
      <section className="public-page gallery-section">
        <GridGallery />
      </section>
    </div>
  );
}

export default Gallery;
