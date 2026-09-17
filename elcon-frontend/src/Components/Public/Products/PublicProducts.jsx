import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { getPublicProducts } from '../../../api/productsService';
import { resolveProductImage } from '../../UserPanel/Product/productImages';
import PublicPageHeader from '../Common/PublicPageHeader';
import './PublicProducts.css';

const SECTIONS = [
  { key: 'joining', title: 'Joining Products' },
  { key: 'shopping', title: 'Shopping Products' },
  { key: 'repurchase', title: 'Repurchase Products' },
];

const SlickArrow = ({ className, onClick, direction }) => (
  <button
    className={`pp-slick-arrow pp-slick-arrow-${direction} ${className || ''}`}
    onClick={onClick}
    aria-label={direction === 'prev' ? 'Previous' : 'Next'}
    type="button"
  >
    <i className={`fa fa-chevron-${direction === 'prev' ? 'left' : 'right'}`}></i>
  </button>
);

const sliderSettings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  swipeToSlide: true,
  prevArrow: <SlickArrow direction="prev" />,
  nextArrow: <SlickArrow direction="next" />,
  responsive: [
    { breakpoint: 1200, settings: { slidesToShow: 3 } },
    { breakpoint: 900, settings: { slidesToShow: 2 } },
    { breakpoint: 560, settings: { slidesToShow: 1, centerMode: true, centerPadding: '30px' } },
  ],
};

const ProductSection = ({ title, products, onProductClick }) => {
  if (!products.length) {
    return (
      <div className="pp-section">
        <h2 className="pp-section-title">
          <span className="pp-section-title-accent"></span>
          {title}
        </h2>
        <div className="pp-empty">No products available in this category.</div>
      </div>
    );
  }

  return (
    <div className="pp-section">
      <h2 className="pp-section-title">
        <span className="pp-section-title-accent"></span>
        {title}
      </h2>
      <div className="pp-slider-wrap">
        <Slider {...sliderSettings}>
          {products.map((product) => {
            const imageUrl = resolveProductImage(product);
            return (
              <div key={product._id || product.productCode} className="pp-slide">
                <div className="pp-card" onClick={() => onProductClick(product)}>
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
              </div>
            );
          })}
        </Slider>
      </div>
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
                <ProductSection
                  key={sec.key}
                  title={sec.title}
                  products={products}
                  onProductClick={handleProductClick}
                />
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default PublicProducts;
