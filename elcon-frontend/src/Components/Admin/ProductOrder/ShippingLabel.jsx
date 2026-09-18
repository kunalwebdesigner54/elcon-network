import React, { useEffect, useState } from 'react';
import './ShippingLabel.css';
import { getOrderByNo } from '../../../api/productsService';
import elconLogo from '../../../Assets/Pictures/dashbaord1.jpeg';

function ShippingLabel() {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const params = new URLSearchParams(window.location.search);
      const orderNo = params.get('orderNo');

      const storedData = localStorage.getItem('shippingData');
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          if (data && data.shippingInformation) {
            setOrderData(data);
            localStorage.removeItem('shippingData');
            setLoading(false);
            return;
          } else {
            localStorage.removeItem('shippingData');
          }
        } catch (error) {
          localStorage.removeItem('shippingData');
        }
      }

      if (orderNo) {
        try {
          const response = await getOrderByNo(orderNo);
          setOrderData(response.order);
        } catch (error) {
          setOrderData(null);
        }
      }

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading || !orderData) {
    return (
      <div className="shipping-label-container">
        <div className="shipping-label-loading">Loading Shipping Label...</div>
      </div>
    );
  }

  // Extract address info from shippingInformation array
  const shippingInfo = orderData.shippingInformation || [];
  const getField = (labelStr) => {
    const field = shippingInfo.find(f => f.label.toLowerCase().includes(labelStr.toLowerCase()));
    return field ? field.value : '';
  };

  const name = getField('name');
  const phone = getField('phone') || getField('mobile');
  const email = getField('email');
  const address = getField('address');
  const city = getField('city');
  const state = getField('state');
  const zip = getField('zip') || getField('pincode');
  const country = getField('country');

  return (
    <div className="shipping-label-page">
      <div className="shipping-label-card">
        <div className="shipping-label-header">
          <div className="shipping-label-brand">
            <img src={elconLogo} alt="ELCON" className="shipping-label-logo" />
            <div className="shipping-label-brand-name">ELCON</div>
          </div>
          <div className="shipping-label-title">SHIPPING LABEL</div>
        </div>
        
        <div className="shipping-label-content">
          <div className="shipping-label-section">
            <div className="shipping-label-section-title">SHIP TO:</div>
            <div className="shipping-label-address-box">
              <div className="shipping-label-name">{name || orderData.memberName}</div>
              {address && <div className="shipping-label-text">{address}</div>}
              {(city || state || zip) && (
                <div className="shipping-label-text">
                  {[city, state, zip].filter(Boolean).join(', ')}
                </div>
              )}
              {country && <div className="shipping-label-text">{country}</div>}
              
              <div className="shipping-label-contact">
                {phone && <div><span className="shipping-label-label">Phone:</span> {phone}</div>}
                {email && <div><span className="shipping-label-label">Email:</span> {email}</div>}
              </div>
            </div>
          </div>

          <div className="shipping-label-section">
            <div className="shipping-label-section-title">ORDER DETAILS:</div>
            <div className="shipping-label-details-grid">
              <div className="shipping-label-detail-item">
                <span className="shipping-label-label">Order No:</span> {orderData.orderNo}
              </div>
              <div className="shipping-label-detail-item">
                <span className="shipping-label-label">Order Date:</span> {orderData.startDate || (orderData.createdAt ? new Date(orderData.createdAt).toLocaleDateString() : '')}
              </div>
              <div className="shipping-label-detail-item">
                <span className="shipping-label-label">Member ID:</span> {orderData.memberId}
              </div>
              <div className="shipping-label-detail-item">
                <span className="shipping-label-label">Items:</span> {orderData.items}
              </div>
            </div>
          </div>
        </div>
        
        <div className="shipping-label-footer">
          <div className="shipping-label-barcode">
            {/* Simple barcode placeholder */}
            <svg width="200" height="50" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="white"/>
              <path d="M10 10v30M15 10v30M25 10v30M30 10v30M35 10v30M45 10v30M55 10v30M60 10v30M70 10v30M75 10v30M80 10v30M95 10v30M100 10v30M110 10v30M120 10v30M125 10v30M135 10v30M140 10v30M150 10v30M165 10v30M170 10v30M180 10v30M185 10v30" stroke="black" strokeWidth="2"/>
              <path d="M20 10v30M40 10v30M50 10v30M65 10v30M85 10v30M90 10v30M105 10v30M115 10v30M130 10v30M145 10v30M155 10v30M160 10v30M175 10v30M190 10v30" stroke="black" strokeWidth="4"/>
            </svg>
            <div className="shipping-label-barcode-text">{orderData.orderNo}</div>
          </div>
        </div>
      </div>

      <div className="shipping-label-actions no-print">
        <button className="shipping-btn shipping-btn-print" onClick={() => window.print()} title="Print this label">
          🖨️ Print Label
        </button>
        <button className="shipping-btn shipping-btn-close" onClick={() => window.close()} title="Close this window">
          ✕ Close
        </button>
      </div>
    </div>
  );
}

export default ShippingLabel;
