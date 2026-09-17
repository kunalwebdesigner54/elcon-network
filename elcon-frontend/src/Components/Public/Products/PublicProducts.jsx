import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicProducts } from '../../../api/productsService';
import { resolveProductImage } from '../../UserPanel/Product/productImages';
import './PublicProducts.css';

const PublicProducts = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Capitalize title
  const pageTitle = type ? `${type.charAt(0).toUpperCase() + type.slice(1)} Products` : 'Products';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await getPublicProducts(type || 'joining');
        const rawProducts = response.products || [];
        const visibleProducts = rawProducts.filter(p => (p.status || '').toUpperCase() === 'SHOWING');
        setProducts(visibleProducts);
      } catch (error) {
        console.error('Failed to fetch public products', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [type]);

  const handleProductClick = (product) => {
    // Redirect unauthenticated users to login if they try to click
    navigate('/user-login', { state: { message: 'Please login to view product details or purchase.' } });
  };

  return (
    <div className="public-products-page">
      <div className="public-container">
        <h1 className="public-products-title">{pageTitle}</h1>
        <p className="public-products-subtitle">Explore our exclusive range of {pageTitle.toLowerCase()}.</p>

        {loading ? (
          <div className="public-products-loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="public-products-empty">No products found for this category.</div>
        ) : (
          <div className="public-products-grid">
            {products.map(product => {
              const imageUrl = resolveProductImage(product);
              return (
                <div key={product.id || product.productCode} className="public-product-card" onClick={() => handleProductClick(product)}>
                  <div className="public-product-image-wrap">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.productName || product.name} className="public-product-image" loading="lazy" />
                    ) : (
                      <div className="public-product-no-image">No Image</div>
                    )}
                    {product.discount > 0 && (
                      <div className="public-product-badge">{product.discount}% OFF</div>
                    )}
                  </div>
                  <div className="public-product-content">
                    <h3 className="public-product-name">{product.productName || product.name}</h3>
                    <p className="public-product-category">{product.category}</p>
                    <div className="public-product-price-row">
                      <span className="public-product-price">₹{product.dpPrice || product.price}</span>
                      {product.mrp > (product.dpPrice || product.price) && (
                        <span className="public-product-mrp">₹{product.mrp}</span>
                      )}
                    </div>
                    <button className="public-product-btn">View Details</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProducts;
