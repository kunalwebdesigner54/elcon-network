import React, { useState, useEffect } from 'react';
import { franchiseGetMyStock, franchiseSellProduct } from '../../../api/managementService';
import { getMemberInfoByUserId } from '../../../api/membersService';
import Swal from 'sweetalert2';
import './FranchiseStyles.css';

function FranchiseProductSell() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [memberId, setMemberId] = useState('');
  const [buyerInfo, setBuyerInfo] = useState(null);
  
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const res = await franchiseGetMyStock();
      if (res?.success) {
        setStocks((res.stocks || []).filter(s => (s?.quantity || 0) > 0)); // Only show items in stock
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load stock' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchBuyer = async () => {
    if (!memberId) return Swal.fire({ icon: 'warning', title: 'Warning', text: 'Please enter Member ID' });
    try {
      const res = await getMemberInfoByUserId(memberId);
      if (res.success && res.data) {
        setBuyerInfo(res.data);
      } else {
        setBuyerInfo(null);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Member not found' });
      }
    } catch (error) {
      setBuyerInfo(null);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error finding member' });
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(c => c.productId === product.productId);
    if (existing) {
      if (existing.quantity >= product.quantity) {
        return Swal.fire({ icon: 'warning', title: 'Warning', text: 'Cannot add more than available stock' });
      }
      setCart(cart.map(c => c.productId === product.productId ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(c => c.productId !== productId));
  };

  const updateCartQuantity = (productId, qty) => {
    const productStock = stocks.find(s => s.productId === productId)?.quantity || 0;
    if (qty > productStock) return Swal.fire({ icon: 'warning', title: 'Warning', text: 'Exceeds available stock' });
    if (qty <= 0) return removeFromCart(productId);
    
    setCart(cart.map(c => c.productId === productId ? { ...c, quantity: qty } : c));
  };

  const handleCheckout = async () => {
    if (!buyerInfo) return Swal.fire({ icon: 'warning', title: 'Warning', text: 'Please select a valid buyer' });
    if (cart.length === 0) return Swal.fire({ icon: 'warning', title: 'Warning', text: 'Cart is empty' });

    const items = cart.map(c => ({
      productId: c.productId,
      quantity: c.quantity
    }));

    try {
      const res = await franchiseSellProduct({ userId: buyerInfo.memberId, items });
      if (res.success) {
        Swal.fire({ icon: 'success', title: 'Success', text: `Sale successful! Order No: ${res.orderNo}` });
        setCart([]);
        setBuyerInfo(null);
        setMemberId('');
        fetchStock(); // refresh stock
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: res.message });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error processing sale' });
    }
  };

  const cartTotal = cart.reduce((acc, curr) => acc + ((curr.dpPrice || curr.price) * curr.quantity), 0);

  return (
    <div className="franchise-container">
      <h2 className="franchise-title">Sell Products (Shortcut Transaction)</h2>
      
      <div className="franchise-split-layout">
        <div className="franchise-left-panel">
          <div className="franchise-card mb-4">
            <h3>Buyer Details</h3>
            <div className="franchise-search-box">
              <input 
                type="text" 
                placeholder="Enter Buyer Member ID..." 
                value={memberId} 
                onChange={(e) => setMemberId(e.target.value.toUpperCase())}
              />
              <button onClick={handleSearchBuyer} className="franchise-btn-primary">Verify</button>
            </div>
            {buyerInfo && (
              <div className="franchise-buyer-info">
                <p><strong>Name:</strong> {buyerInfo.name}</p>
                <p><strong>Member ID:</strong> {buyerInfo.memberId}</p>
                <p><strong>Contact:</strong> {buyerInfo.contactNo}</p>
              </div>
            )}
          </div>

          <div className="franchise-card">
            <h3>Available Stock</h3>
            {loading ? <p>Loading stock...</p> : (
              <div className="franchise-product-grid">
                {stocks.map(stock => (
                  <div key={stock.productId} className="franchise-product-card">
                    {stock.image && <img src={stock.image} alt={stock.productName} />}
                    <div className="franchise-product-details">
                      <h4>{stock.productName}</h4>
                      <p className="price">₹{stock.dpPrice || stock.price}</p>
                      <p className="stock-info">Stock: {stock.quantity}</p>
                      <button onClick={() => addToCart(stock)} className="franchise-btn-secondary">Add to Cart</button>
                    </div>
                  </div>
                ))}
                {stocks.length === 0 && <p>No stock available to sell.</p>}
              </div>
            )}
          </div>
        </div>

        <div className="franchise-right-panel">
          <div className="franchise-card">
            <h3>Current Order</h3>
            {cart.length === 0 ? (
              <p className="empty-cart">No items added yet.</p>
            ) : (
              <div className="franchise-cart-items">
                {cart.map(item => (
                  <div key={item.productId} className="franchise-cart-item">
                    <div>
                      <h5>{item.productName}</h5>
                      <p>₹{item.dpPrice || item.price}</p>
                    </div>
                    <div className="cart-controls">
                      <input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateCartQuantity(item.productId, parseInt(e.target.value) || 0)}
                        min="0"
                        max={stocks.find(s => s.productId === item.productId)?.quantity}
                      />
                      <button onClick={() => removeFromCart(item.productId)} className="btn-remove">×</button>
                    </div>
                  </div>
                ))}
                <div className="franchise-cart-total">
                  <h4>Total Amount:</h4>
                  <h3>₹{cartTotal.toLocaleString('en-IN')}</h3>
                </div>
                <button onClick={handleCheckout} className="franchise-btn-checkout">Complete Sale</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FranchiseProductSell;
