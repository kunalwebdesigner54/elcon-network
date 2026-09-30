import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './ProductsSection.css';
import { getPublicProducts } from '../../../api/productsService';
import { resolveProductImage } from '../../UserPanel/Product/productImages';
import '../Products/PublicProducts.css'; // Reuse product card styling

function NextArrow(props) {
  const { onClick } = props;
  return (
    <div className="product-slider-arrow product-slider-next" onClick={onClick}>
      <i className="fa-solid fa-chevron-right"></i>
    </div>
  );
}

function PrevArrow(props) {
  const { onClick } = props;
  return (
    <div className="product-slider-arrow product-slider-prev" onClick={onClick}>
      <i className="fa-solid fa-chevron-left"></i>
    </div>
  );
}

function ProductsSection() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    // Fetch actual products
    const fetchProducts = async () => {
      try {
        const response = await getPublicProducts('shopping'); // Assuming we show shopping products by default
        const raw = response.products || [];
        const showingProducts = raw.filter((p) => (p.status || '').toUpperCase() === 'SHOWING');
        setProducts(showingProducts.slice(0, 8));
      } catch (err) {
        console.error('Error fetching products for home page', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getSlidesToShow = () => {
    if (windowWidth < 768) return 1;
    if (windowWidth < 992) return 2;
    if (windowWidth < 1200) return 3;
    return 4;
  };

  const settings = {
    dots: false,
    infinite: products.length > getSlidesToShow(),
    speed: 500,
    slidesToShow: getSlidesToShow(),
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  const handleProductClick = () => {
    navigate('/product');
  };

  return (
    <section className="home-products-section">
      <div className="public-container">
        <div className="home-products-header">
          <h2>Our Products</h2>
          <p>
            Explore our range of high-quality products. Join our network and get the best deals on premium items.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>No products available at the moment.</div>
        ) : (
          <div className="products-slider-wrapper">
            <Slider {...settings}>
              {products.map((product) => {
                const imageUrl = resolveProductImage(product);
                return (
                  <div key={product._id || product.productCode} className="product-slide-item pp-slide">
                    <div className="pp-card">
                      <div className="pp-card-img-wrap">
                        {imageUrl ? (
                          <img src={imageUrl} alt={product.productName || product.name} className="pp-card-img" loading="lazy" />
                        ) : (
                          <div className="pp-card-no-img">No Image</div>
                        )}
                        {product.discount > 0 && (
                          <span className="pp-card-badge">
                            ₹{product.discount} OFF
                          </span>
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
                        <button className="pp-card-btn" onClick={handleProductClick}>View Details</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Slider>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductsSection;
