import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyCart.css';
import { clearCart, checkoutCart, getCart, removeCartItem, updateCartItem } from '../../../../api/productsService';
import { resolveProductImage } from '../productImages';

const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6h18" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 6v12c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V6" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 11v6" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
    <path d="M14 11v6" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const CartItem = ({ item, onRemove, onQuantityChange }) => (
  <div className="mc-item">
    <div className="mc-item-left">
      <img src={resolveProductImage(item)} alt="product" />
    </div>
    <div className="mc-item-mid">
      <div className="mc-title">{item.productName}</div>
      <div className="mc-bv">B.V. Point : {item.bvPoint || 0}</div>
      <div className="mc-qty">
        <button className="qty-btn" onClick={() => onQuantityChange(item, Math.max(1, item.quantity - 1))}>-</button>
        <span className="qty-val">{item.quantity}</span>
        <button className="qty-btn" onClick={() => onQuantityChange(item, item.quantity + 1)}>+</button>
      </div>
    </div>
    <div className="mc-item-right">
      <div className="mc-price">₹{item.price}x{item.quantity}= </div>
      <div className="mc-total"> ₹{item.totalPrice}</div>
      <button className="mc-delete" aria-label="Delete item" onClick={() => onRemove(item)}><DeleteIcon/></button>
    </div>
  </div>
)

export default function MyCart(){
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ subtotal: 0, bvPoint: 0 });

  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await getCart();
      setCartItems(response.cart?.items || []);
    } catch (error) {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
    const bvPoint = cartItems.reduce((sum, item) => sum + Number(item.bvPoint || 0) * Number(item.quantity || 0), 0);
    setSummary({ subtotal, bvPoint });
  }, [cartItems]);
  
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
          <input className="mc-coupon-input" placeholder="Apply Coupon Code" />
          <button className="mc-coupon-apply">Apply</button>
        </div>

        <div className="mc-row"><span>Sub Total</span><strong>₹ {summary.subtotal.toFixed(2)}</strong></div>
        <div className="mc-row"><span>Shipping Charge</span><strong>₹ 0.00</strong></div>
        <div className="mc-row coupon"><span>Coupon Discount</span><strong>- ₹ 00.00</strong></div>
        <div className="mc-total-row"><span>Total Amount</span><strong>₹ {summary.subtotal.toFixed(2)}</strong></div>

        <div className="mc-address">
          <div className="mc-address-head">Product Delivery Address
            <button className="mc-address-edit" aria-label="Edit address">⋯</button>
          </div>
          <div className="mc-address-body">
            <div className="mc-deliver">Deliver to : Sonali Shirke</div>
            <div>Flat no A-201, Oxford Paradise, Vidya Valley School Road Susgaon</div>
            <div>Maharashtra Pune - 411021</div>
          </div>
        </div>

        <div className="mc-actions">
          <button className="btn-order" onClick={handleOrderNow}>Order Now</button>
         
        </div>
      </div>
    </div>
  )
}
