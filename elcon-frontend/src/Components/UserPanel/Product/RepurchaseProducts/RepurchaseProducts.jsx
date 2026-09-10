import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Common/UserLayout.css';
import './RepurchaseProducts.css';
import { addCartItem, getPublicProducts } from '../../../../api/productsService';
import { resolveProductImage } from '../productImages';

const normalizeOptionalValue = (value) => {
  const normalizedValue = String(value ?? '').trim();
  return normalizedValue && normalizedValue !== '-' ? normalizedValue : '';
};

const getOptions = (value) => normalizeOptionalValue(value)
  .split(',')
  .map((option) => option.trim())
  .filter(Boolean);

function RepurchaseProducts() {
  const navigate = useNavigate();
  const [repurchaseProducts, setRepurchaseProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedColors, setSelectedColors] = useState({});

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

  const handleSizeChange = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const handleColorChange = (productId, color) => {
    setSelectedColors(prev => ({ ...prev, [productId]: color }));
  };

  const handleAddToCart = async (product) => {
    const productId = product._id || product.id || product.productCode;
    const size = selectedSizes[productId] || '';
    const color = selectedColors[productId] || '';
    const sizeOptions = getOptions(product.size);
    const colorOptions = getOptions(product.color);

    // Check if product has variants that require selection
    if ((sizeOptions.length > 1 && !size) || (colorOptions.length > 1 && !color)) {
      window.alert('Please select the available size and color before adding this product to cart.');
      return;
    }

    try {
      await addCartItem(productId, 1, { selectedSize: size, selectedColor: color });
      navigate('/user/product/my_cart');
    } catch (error) {
      navigate('/user/product/my_cart');
    }
  };

  return (
    <div className="user-product-page">
      <h2 className="page-heading">Repurchase Products</h2>
      <div className="user-panel user-product-panel">

        <div className="product-filter-wrapper" style={{ background: 'var(--panel-bg, #0B132B)', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div className="product-filter-bar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ flex: '0 0 auto', minWidth: '160px', padding: '12px 15px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', cursor: 'pointer' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '12px 15px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}
            />
          </div>
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
                {(getOptions(product.size).length > 1 || getOptions(product.color).length > 1) && (
                  <div className="user-product-variants" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px', marginBottom: '8px' }}>
                    {getOptions(product.size).length > 1 && (
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#fff' }}>
                        Size
                        <select
                          value={selectedSizes[product.id || product.productCode] || ''}
                          onChange={(e) => handleSizeChange(product.id || product.productCode, e.target.value)}
                          style={{ padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', cursor: 'pointer' }}
                        >
                          <option value="">Select size</option>
                          {getOptions(product.size).map((size) => <option key={size} value={size}>{size}</option>)}
                        </select>
                      </label>
                    )}
                    {getOptions(product.color).length > 1 && (
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#fff' }}>
                        Color
                        <select
                          value={selectedColors[product.id || product.productCode] || ''}
                          onChange={(e) => handleColorChange(product.id || product.productCode, e.target.value)}
                          style={{ padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', cursor: 'pointer' }}
                        >
                          <option value="">Select color</option>
                          {getOptions(product.color).map((color) => <option key={color} value={color}>{color}</option>)}
                        </select>
                      </label>
                    )}
                  </div>
                )}
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


