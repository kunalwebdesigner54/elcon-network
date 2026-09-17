import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicProducts } from '../../../api/productsService';
import { resolveProductImage } from '../../UserPanel/Product/productImages';
import PublicPageHeader from '../Common/PublicPageHeader';
import './PublicProducts.css';

const SECTIONS = [
  { key: 'joining', title: 'Joining Products' },
  { key: 'shopping', title: 'Shopping Products' },
  { key: 'repurchase', title: 'Repurchase Products' },
];

const ProductCarousel = ({ products, onProductClick }) => {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [products]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('.pp-card')?.offsetWidth || 280;
    el.scrollBy({ left: dir * (cardWidth + 24), behavior: 'smooth' });
  };

  if (!products.length) {
    return <div className="pp-empty">No products available in this category.</div>;
  }

  return (
    <div className="pp-carousel-wrap">
      {canScrollLeft && (
        <button className="pp-carousel-btn pp-carousel-btn-left" onClick={() => scroll(-1)} aria-label="Scroll left">
          <i className="fa fa-chevron-left"></i>
        </button>
      )}
      <div className="pp-carousel-track" ref={trackRef}>
        {products.map((product) => {
          const imageUrl = resolveProductImage(product);
          return (
            <div key={product._id || product.productCode} className="pp-card" onClick={() => onProductClick(product)}>
              <div className="pp-card-img-wrap">
                {imageUrl ? (
                  <img src={imageUrl} alt={product.productName || product.name} className="pp-card-img" loading="lazy" />
                ) : (
                  <div className="pp-card-no-img">No Image</div>
                )}
                {product.discount > 0 && (
                  <span className="pp-card-badge">{product.discount}% OFF</span>
                )}
              </div>
              <div className="pp-card-body">
                <h4 className="pp-card-name">{product.productName || product.name}</h4>
                <p className="pp-card-category">{product.category}</p>
                <div className="pp-card-price-row">
                  <span className="pp-card-price">₹{product.dpPrice || product.price}</span>
                  {product.mrp > (product.dpPrice || product.price) && (
                    <span className="pp-card-mrp">₹{product.mrp}</span>
                  )}
                </div>
                <button className="pp-card-btn">View Details</button>
              </div>
            </div>
          );
        })}
      </div>
      {canScrollRight && (
        <button className="pp-carousel-btn pp-carousel-btn-right" onClick={() => scroll(1)} aria-label="Scroll right">
          <i className="fa fa-chevron-right"></i>
        </button>
      )}
    </div>
  );
};

const PublicProducts = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const results = {};
      await Promise.all(
        SECTIONS.map(async (sec) => {
          try {
            const response = await getPublicProducts(sec.key);
            const raw = response.products || [];
            results[sec.key] = raw.filter((p) => (p.status || '').toUpperCase() === 'SHOWING');
          } catch {
            results[sec.key] = [];
          }
        })
      );
      setSections(results);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleProductClick = () => {
    navigate('/user-login', { state: { message: 'Please login to view product details or purchase.' } });
  };

  return (
    <div className="pp-page">
      <PublicPageHeader title="OUR PRODUCTS" />

      <section className="pp-content">
        <div className="public-container">
          {loading ? (
            <div className="pp-loading">
              <div className="pp-spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : (
            SECTIONS.map((sec) => {
              const products = sections[sec.key] || [];
              return (
                <div key={sec.key} className="pp-section">
                  <h2 className="pp-section-title">
                    <span className="pp-section-title-accent"></span>
                    {sec.title}
                  </h2>
                  <ProductCarousel products={products} onProductClick={handleProductClick} />
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default PublicProducts;
