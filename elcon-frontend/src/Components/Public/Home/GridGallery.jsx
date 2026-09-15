import React, { useState } from 'react';
import './GridGallery.css';

const DEFAULT_IMAGES = [
  "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/612d1402-0ad9-4135-3bbc-a30a6a252b00/w=800",
  "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/6d2ad64a-102d-4eab-0efe-31479e34b500/w=800",
  "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/51984031-9176-484b-f5e0-4af9a8e9ed00/w=800",
  "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/34ce1842-4b7a-4d52-0302-38582c341700/w=800",
  "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/88369c6d-00cc-4ac9-74ca-0f0965e06300/w=800",
  "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/aeaa0756-9647-4f6c-d900-204bd25e4a00/w=800",
  "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/316d1761-fd79-4ca9-b8d4-f2bb20521a00/w=800",
  "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/be854dd1-37aa-4fc7-f569-fdb948109300/w=800",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800"
];

function GridGallery({ images = DEFAULT_IMAGES }) {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const openLightbox = (index) => {
    setPhotoIndex(index);
    setIsOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  const closeLightbox = () => {
    setIsOpen(false);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setPhotoIndex((photoIndex + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setPhotoIndex((photoIndex + images.length - 1) % images.length);
  };

  return (
    <div className="grid-gallery-wrapper">
      <div className="grid-gallery-container">
        {images.map((imgSrc, index) => (
          <div 
            key={index} 
            className="grid-gallery-item"
            onClick={() => openLightbox(index)}
          >
            <div className="grid-gallery-overlay">
              <i className="fa-solid fa-plus"></i>
            </div>
            <img src={imgSrc} alt={`Gallery ${index + 1}`} loading="lazy" />
          </div>
        ))}
      </div>

      {isOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={images[photoIndex]} alt={`Gallery ${photoIndex + 1}`} className="lightbox-image" />
            
            <button className="lightbox-close" onClick={closeLightbox}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            
            <button className="lightbox-prev" onClick={prevImage}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            
            <button className="lightbox-next" onClick={nextImage}>
              <i className="fa-solid fa-chevron-right"></i>
            </button>

            <div className="lightbox-footer">
              <span>Image {photoIndex + 1} of {images.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GridGallery;
