import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CompletePayment.css';
import { checkoutCart, getCart } from '../../../../api/productsService';
import { getProfile } from '../../../../api/authService';

const CompletePayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('');
  const [transactionPassword, setTransactionPassword] = useState('');
  const [reenterPassword, setReenterPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [orderAmount, setOrderAmount] = useState(Number(location.state?.orderAmount || 0));
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [paymentBalances, setPaymentBalances] = useState({ eWallet: '' });

  const bankDetails = {
    bankName: 'State Bank Of India',
    branch: 'Pashan Pune',
    accountHolder: 'Elcon Network',
    accountNo: '456885485685',
    accountType: 'Current Account',
    ifscCode: 'Sbin004736',
    upiId: 'Elcon.network@oksbi'
  };

  const paymentModes = {
    'e-wallet': { label: 'E-Wallet', amount: paymentBalances.eWallet ? `₹ ${paymentBalances.eWallet}` : '' },
    'upi': { label: 'UPI ID', amount: '' },
    'bank': { label: 'BANK TRANSFER', amount: '' }
  };



  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await getCart();
        const items = response.cart?.items || [];
        setCartItems(items);

        const subtotal = items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
        if (items.length) {
          setOrderAmount(subtotal);
        }
      } catch (error) {
        setCartItems([]);
      } finally {
        setIsLoadingCart(false);
      }
    };

    loadCart();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getProfile();
        const data = res.data || {};

        // If backend exposes wallet balances, map them here.
        // Common field names may be `eWallet` or `wallet`.
        setPaymentBalances({
          eWallet: data.eWallet ?? data.eWalletBalance ?? data.wallet ?? '',
        });
      } catch (err) {
        // ignore - keep balances empty
      }
    };

    loadProfile();
  }, []);



  const handlePayNow = async () => {
    if (!selectedPaymentMode) {
      alert('Please select a payment mode');
      return;
    }
    if (!transactionPassword || !reenterPassword) {
      alert('Please enter both passwords');
      return;
    }
    if (transactionPassword !== reenterPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await checkoutCart({
        paymentMode: paymentModes[selectedPaymentMode].label,
        transactionPassword,
        confirmTransactionPassword: reenterPassword,
      });

      navigate(`/user/product/my-orders/details/${response.order.orderNo}`);
    } catch (error) {
      alert(error?.response?.data?.message || 'Payment could not be completed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="complete-payment-wrapper">
      <div className="payment-header">
        <h2>Complete Payment</h2>
      </div>

      <div className="payment-container">
        {/* Left Section - Payment Mode Selection */}
        <div className="payment-left">
          <div className="payment-mode-card">
            <h3 className="mode-title">Select Payment Mode</h3>
            <div className="mode-separator"></div>

            {Object.entries(paymentModes).map(([key, value]) => (
              <div key={key} className="mode-option">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="paymentMode"
                    value={key}
                    checked={selectedPaymentMode === key}
                    onChange={(e) => setSelectedPaymentMode(e.target.value)}
                    className="radio-input"
                  />
                  <span className="radio-custom"></span>
                  <span className="mode-text">
                    {value.label}
                    {value.amount && <span className="mode-amount"> - {value.amount}</span>}
                  </span>
                </label>
              </div>
            ))}
          </div>

          {/* Bank Account Details - Show when Bank Transfer or UPI is selected */}
          {(selectedPaymentMode === 'bank' || selectedPaymentMode === 'upi') && (
            <div className="bank-details-card">
              <h4 className="details-title">
                {selectedPaymentMode === 'upi' ? 'UPI Details' : 'Bank Account Details'}
              </h4>
              <table className="bank-details-table">
                <tbody>
                  {selectedPaymentMode === 'bank' && (
                    <>
                      <tr>
                        <td className="detail-label">Bank Name</td>
                        <td className="detail-value">{bankDetails.bankName}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">Bank Branch</td>
                        <td className="detail-value">{bankDetails.branch}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">A/c Holder Name</td>
                        <td className="detail-value">{bankDetails.accountHolder}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">A/c No.</td>
                        <td className="detail-value">{bankDetails.accountNo}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">A/c Type</td>
                        <td className="detail-value">{bankDetails.accountType}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">IFSC Code</td>
                        <td className="detail-value">{bankDetails.ifscCode}</td>
                      </tr>
                    </>
                  )}
                  <tr className="upi-row">
                    <td className="detail-label">UPI ID :</td>
                    <td className="detail-value">
                      {bankDetails.upiId}
                      <span className="copy-icon">📋</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Section - Order Summary & Payment */}
        <div className="payment-right">
          <div className="order-summary-card">
            <h3 className="summary-title">
              Order Amount
            </h3>
            <div className="amount-display">₹ {isLoadingCart ? 'Loading...' : orderAmount.toFixed(2)}</div>

            {cartItems.length > 0 && (
              <div className="proof-section" style={{ marginTop: '14px' }}>
                <label className="proof-label">Selected Cart Items</label>
                <div style={{ display: 'grid', gap: '8px', marginTop: '8px' }}>
                  {cartItems.map((item) => (
                    <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '14px' }}>
                      <span>{item.productName} x {item.quantity}</span>
                      <strong>₹ {Number(item.totalPrice || 0).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}


            <div className="password-section">
              <label className="password-label">Enter Transaction Password</label>
              <input
                type="password"
                value={transactionPassword}
                onChange={(e) => setTransactionPassword(e.target.value)}
                placeholder="Enter your transaction password"
                className="password-input"
              />
            </div>

            <div className="password-section">
              <label className="password-label">Re-enter Transaction Password</label>
              <input
                type="password"
                value={reenterPassword}
                onChange={(e) => setReenterPassword(e.target.value)}
                placeholder="Re-enter your transaction password"
                className="password-input"
              />
            </div>

            <button className="pay-now-btn" onClick={handlePayNow} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletePayment;

