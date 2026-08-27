import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Common/UserLayout.css';
import './ShoppingProducts.css';
import { addCartItem, getPublicProducts } from '../../../../api/productsService';
import { resolveProductImage } from '../productImages';

function ShoppingProducts() {
  const navigate = useNavigate();
  const [shoppingProducts, setShoppingProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await getPublicProducts('shopping');
        setShoppingProducts(response.products || []);
      } catch (error) {
        setShoppingProducts([]);
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
      <div className="user-panel user-product-panel">
        <h2 className="page-heading">Shopping Products</h2>

        <div className="user-product-grid">
          {shoppingProducts.map((product) => {
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

export default ShoppingProducts;
