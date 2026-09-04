import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Common/UserLayout.css';
import './RepurchaseProducts.css';
import { addCartItem, getPublicProducts } from '../../../../api/productsService';
import { resolveProductImage } from '../productImages';

function RepurchaseProducts() {
  const navigate = useNavigate();
  const [repurchaseProducts, setRepurchaseProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', ...new Set(repurchaseProducts.map(p => p.category).filter(Boolean))];

  const filteredProducts = repurchaseProducts.filter(p => {
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = !searchQuery || (p.productName || p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await getPublicProducts('repurchase');
        const rawProducts = response.products || [];
        const visibleProducts = rawProducts.filter(p => (p.status || '').toUpperCase() === 'SHOWING');
        setRepurchaseProducts(visibleProducts);
      } catch (error) {
        setRepurchaseProducts([]);
      }
    };

    loadProducts();
  }, []);

  const handleProductClick = (product) => {
    navigate('/user/product/product_details', { state: { product } });
  };

  const handleAddToCart = async (product) => {
    try {
      await addCartItem(product._id || product.id || product.productCode, 1);
      navigate('/user/product/my_cart');
    } catch (error) {
      navigate('/user/product/my_cart');
    }
  };

  return (
    <div className="user-product-page">
      <h2 className="page-heading">Repurchase Products</h2>
      <div className="user-panel user-product-panel">

        <div className="product-filter-bar" style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, minWidth: '200px', padding: '10px 15px', borderRadius: '8px', background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--glass-border-light)', outline: 'none' }}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '10px 15px', borderRadius: '8px', background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--glass-border-light)', outline: 'none', minWidth: '150px' }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>

        <div className="user-product-grid">
          {filteredProducts.map((product) => {
            const stockStatus = (product.quantity !== undefined && product.quantity !== null && product.quantity !== '')
                ? (Number(product.quantity) > 0 ? 'In Stock' : 'Out of Stock')
                : (product.stock === 'Out of Stock' ? 'Out of Stock' : 'In Stock');

            return (
            <article
              className="user-product-card"
              key={product.id || product.productCode}
              role="button"
              tabIndex={0}
              onClick={() => handleProductClick(product)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleProductClick(product);
                }
              }}
            >
              <div className="user-product-image-wrap">
                <img
                  src={resolveProductImage(product)}
                  alt={product.productName || product.name}
                  className="user-product-image"
                  loading="lazy"
                />
              </div>

              <div className="user-product-footer">
                <div className="user-product-meta">
                  <h3>{product.productName || product.name}</h3>
                  <div className="user-product-meta-row">
                    <span className={`user-product-stock ${stockStatus === 'In Stock' ? 'in-stock' : 'out-stock'}`}>
                      {stockStatus}
                    </span>
                    <span className="user-product-category">Category : {product.category}</span>
                  </div>
                </div>

                <div className="user-product-price-row">
                  <span className="user-product-mrp">
                    M.R.P <del>{product.mrp}</del>
                  </span>
                  <span className="user-product-price">₹ {product.price}</span>
                </div>

                <button
                  type="button"
                  className="user-product-btn"
                  disabled={stockStatus === 'Out of Stock'}
                  style={{ opacity: stockStatus === 'Out of Stock' ? 0.5 : 1, cursor: stockStatus === 'Out of Stock' ? 'not-allowed' : 'pointer' }}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (stockStatus !== 'Out of Stock') handleAddToCart(product);
                  }}>
                  Add to cart
                </button>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RepurchaseProducts;


