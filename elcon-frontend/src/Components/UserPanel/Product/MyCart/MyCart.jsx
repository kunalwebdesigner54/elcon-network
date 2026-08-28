import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyCart.css';
import { clearCart, checkoutCart, getCart, removeCartItem, updateCartItem } from '../../../../api/productsService';
import { getProfile } from '../../../../api/authService';
import { resolveProductImage } from '../productImages';

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CartItem = ({ item, onRemove, onQuantityChange }) => (
  <div className="mc-item">
    <div className="mc-item-header">
      <div className="mc-title">{item.productName}</div>
      <button className="mc-delete" aria-label="Delete item" onClick={() => onRemove(item)}>
        <DeleteIcon />
      </button>
    </div>
    
    <div className="mc-divider"></div>

    <div className="mc-item-body">
      <div className="mc-item-image">
        <img src={resolveProductImage(item)} alt="product" />
      </div>
      
      <div className="mc-item-price-section">
        <div className="mc-price">₹ {item.price} x</div>
        
        <div className="mc-qty-vertical">
          <button className="qty-btn-v" onClick={() => onQuantityChange(item, item.quantity + 1)}>+</button>
          <span className="qty-val-v">{item.quantity}</span>
          <button className="qty-btn-v" onClick={() => onQuantityChange(item, Math.max(1, item.quantity - 1))}>-</button>
        </div>
        
        <div className="mc-total">= {(item.price * item.quantity).toFixed(2)}</div>
      </div>
    </div>
    
    <div className="mc-divider"></div>

    <div className="mc-item-footer">
      <span>Coupon : {item.discount || 0}</span>
      <span className="mc-separator">|</span>
      <span>BV Point : {item.bvPoint || 0}</span>
    </div>
  </div>
)

export default function MyCart(){
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponWalletBalance, setCouponWalletBalance] = useState(0);
  const [summary, setSummary] = useState({ subtotal: 0, bvPoint: 0, appliedDiscount: 0 });
  const [deliveryAddress, setDeliveryAddress] = useState(null);

  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await getCart();
      setCartItems(response.cart?.items || []);
      setCouponWalletBalance(response.couponWalletBalance || 0);
    } catch (error) {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    loadDeliveryAddress();
  }, []);

  const loadDeliveryAddress = async () => {
    try {
      const response = await getProfile();
      if (response?.success && response.data) {
        setDeliveryAddress(response.data);
      }
    } catch (err) {
      // Address will show fallback text
    }
  };

  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
    const bvPoint = cartItems.reduce((sum, item) => sum + Number(item.bvPoint || 0) * Number(item.quantity || 0), 0);
    const totalItemDiscount = cartItems.reduce((sum, item) => sum + (Number(item.discount || 0) * Number(item.quantity || 0)), 0);
    const appliedDiscount = Math.min(totalItemDiscount, couponWalletBalance);
    
    setSummary({ subtotal, bvPoint, appliedDiscount });
  }, [cartItems, couponWalletBalance]);
  
  const handleOrderNow = () => {
    navigate('/user/payment/complete-payment', {
      state: {
        orderAmount: summary.subtotal,
        bvPoint: summary.bvPoint,
      },
    });
  };

  const handleRemove = async (item) => {
    await removeCartItem(item.productId);
    loadCart();
  };

  const handleQuantityChange = async (item, quantity) => {
    await updateCartItem(item.productId, quantity);
    loadCart();
  };

  const handleClearCart = async () => {
    await clearCart();
    loadCart();
  };

  return (
    <div className="mycart-page container">
     
      <div className="mc-top-row">
        <h3 className="mc-header">My Cart</h3>
        <button className="mc-clear" onClick={handleClearCart}>X Clear Cart</button>
      </div>

      <div className="mc-box">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading cart...</div>
        ) : cartItems.length ? (
          cartItems.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onRemove={handleRemove}
              onQuantityChange={handleQuantityChange}
            />
          ))
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>Your cart is empty.</div>
        )}
      </div>

      <div className="mc-summary">
        <h4>Order Summery</h4>
        <div className="mc-row"><span>Total B.V Point =</span><strong>{summary.bvPoint}</strong></div>

        <div className="mc-coupon-row">
          <div className="mc-coupon-balance" style={{ color: '#00cc66', fontWeight: 'bold' }}>
            Available Coupon Wallet Balance: ₹ {couponWalletBalance.toFixed(2)}
          </div>
        </div>

        <div className="mc-row"><span>Sub Total</span><strong>₹ {summary.subtotal.toFixed(2)}</strong></div>
        <div className="mc-row"><span>Shipping Charge</span><strong>₹ 0.00</strong></div>
        <div className="mc-row coupon"><span>Coupon Discount</span><strong>- ₹ {(summary.appliedDiscount || 0).toFixed(2)}</strong></div>
        <div className="mc-total-row"><span>Total Amount</span><strong>₹ {(summary.subtotal - (summary.appliedDiscount || 0)).toFixed(2)}</strong></div>

        <div className="mc-address">
          <div className="mc-address-head">Product Delivery Address
            <button className="mc-address-edit" aria-label="Edit address" title="Edit Address" onClick={() => navigate('/user/profile/update-profile')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
          </div>
          <div className="mc-address-body">
            <div className="mc-deliver">Deliver to : {deliveryAddress?.name || '---'}</div>
            <div>{deliveryAddress?.address || 'No address available'}</div>
            <div>{[deliveryAddress?.state, deliveryAddress?.city].filter(Boolean).join(' ') || ''}{deliveryAddress?.pincode ? ` - ${deliveryAddress.pincode}` : ''}</div>
          </div>
        </div>

        <div className="mc-actions">
          <button className="btn-order" onClick={handleOrderNow}>Order Now</button>
         
        </div>
      </div>
    </div>
  )
}
