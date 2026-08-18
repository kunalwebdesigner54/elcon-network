import React, { useEffect, useState } from 'react';
import './Invoice.css';
import elconLogo from '../../../../Assets/Pictures/dashbaord1.jpeg';
import { resolveProductImage } from '../productImages';

function Invoice({ invoiceData, onClose }) {
  const [isReadyToPrint, setIsReadyToPrint] = useState(false);

  useEffect(() => {
    // Small delay to ensure content is rendered
    setIsReadyToPrint(true);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // You can integrate a PDF library like jsPDF here
    alert('Download functionality can be integrated with jsPDF library');
  };

  // Extract shipping info
  const getShippingInfo = () => {
    if (invoiceData?.shippingInformation) {
      const info = {};
      invoiceData.shippingInformation.forEach((field) => {
        if (field.label === 'Name') info.name = field.value;
        if (field.label === 'Contact No') info.contact = field.value;
        if (field.label === 'Address') info.address = field.value;
        if (field.label === 'Area') info.area = field.value;
        if (field.label === 'State,City') info.city = field.value;
        if (field.label === 'Pin Code') info.pincode = field.value;
      });
      return info;
    }
    return {};
  };

  const shippingInfo = getShippingInfo();

  // Calculate subtotal and other values
  const subtotal = invoiceData?.items?.reduce((sum, item) => sum + item.totalPrice, 0) || 0;
  const shipping = invoiceData?.shippingCharge || 0;
  const discount = invoiceData?.discountCoupon || 0;
  const total = invoiceData?.finalTotal || (subtotal + shipping - discount);

  return (
    <div className="invoice-container">
      <div className="invoice-paper">
        {/* Header */}
        <div className="invoice-header">
          <div className="invoice-logo-section">
            <img src={elconLogo} alt="ELCON Network Logo" className="invoice-elcon-logo" />
          </div>
          <div className="invoice-title-section">
            <div className="invoice-main-title">INVOICE NO : {invoiceData?.orderNo || 'ORD0000'}</div>
            <div className="invoice-date">
              Date : {invoiceData?.orderDate || '23-APR-2026 04:36 PM'}
            </div>
          </div>
        </div>

        {/* Company Name */}
        <div className="invoice-company-name">Earn Learn And Contribution</div>

        {/* Order Items Section */}
        <div className="invoice-section">
          <div className="invoice-section-title">Order Items</div>

          <div className="invoice-table-wrapper">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Dp Price</th>
                  <th>Qty</th>
                  <th>Sub Total</th>
                  <th>Discount</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData?.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="invoice-product-name">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={resolveProductImage(item.imageKey || item.name)}
                          alt={item.name}
                          style={{ width: '34px', height: '34px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        {item.name}
                      </span>
                    </td>
                    <td className="invoice-text-center">{item.price.toFixed(2)}</td>
                    <td className="invoice-text-center">{item.quantity}</td>
                    <td className="invoice-text-center">{item.totalPrice.toFixed(2)}</td>
                    <td className="invoice-text-center">
                      {(discount / invoiceData.items.length).toFixed(2)}
                    </td>
                    <td className="invoice-text-center">
                      {(
                        item.totalPrice -
                        discount / invoiceData.items.length
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shipping and Summary Section */}
        <div className="invoice-bottom-section">
          {/* Shipping Information */}
          <div className="invoice-shipping-section">
            <div className="invoice-section-title">Shipping Information</div>
            <div className="invoice-shipping-grid">
              {shippingInfo.name && (
                <div className="invoice-info-row">
                  <span className="invoice-info-label">Name :</span>
                  <span className="invoice-info-value">{shippingInfo.name}</span>
                </div>
              )}
              {shippingInfo.address && (
                <div className="invoice-info-row">
                  <span className="invoice-info-label">Address :</span>
                  <span className="invoice-info-value">{shippingInfo.address}</span>
                </div>
              )}
              {shippingInfo.area && (
                <div className="invoice-info-row">
                  <span className="invoice-info-label">Area :</span>
                  <span className="invoice-info-value">{shippingInfo.area}</span>
                </div>
              )}
              {shippingInfo.city && (
                <div className="invoice-info-row">
                  <span className="invoice-info-label">City :</span>
                  <span className="invoice-info-value">{shippingInfo.city}</span>
                </div>
              )}
              {shippingInfo.pincode && (
                <div className="invoice-info-row">
                  <span className="invoice-info-label">Pincode No :</span>
                  <span className="invoice-info-value">{shippingInfo.pincode}</span>
                </div>
              )}
              {shippingInfo.contact && (
                <div className="invoice-info-row">
                  <span className="invoice-info-label">Contact No :</span>
                  <span className="invoice-info-value">{shippingInfo.contact}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="invoice-summary-section">
            <div className="invoice-section-title">Order Summary</div>
            <div className="invoice-summary-grid">
              <div className="invoice-summary-row">
                <span className="invoice-summary-label">Subtotal :</span>
                <span className="invoice-summary-value">{subtotal.toFixed(2)}</span>
              </div>
              <div className="invoice-summary-row">
                <span className="invoice-summary-label">Shipping :</span>
                <span className="invoice-summary-value">+{shipping.toFixed(2)}</span>
              </div>
              <div className="invoice-summary-row">
                <span className="invoice-summary-label">Discount :</span>
                <span className="invoice-summary-value">-{discount.toFixed(2)}</span>
              </div>
              <div className="invoice-summary-row invoice-summary-total">
                <span className="invoice-summary-label">Total :</span>
                <span className="invoice-summary-value">{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (Hide on Print) */}
      <div className="invoice-actions no-print">
        <button className="invoice-btn invoice-btn-print" onClick={handlePrint} title="Print this invoice">
          <span className="invoice-btn-icon">🖨️</span>
          <span className="invoice-btn-text">Print</span>
        </button>
        <button className="invoice-btn invoice-btn-download" onClick={handleDownload} title="Download as PDF">
          <span className="invoice-btn-icon">⬇️</span>
          <span className="invoice-btn-text">Download</span>
        </button>
        <button className="invoice-btn invoice-btn-close" onClick={onClose} title="Close this window">
          <span className="invoice-btn-icon">✕</span>
          <span className="invoice-btn-text">Close</span>
        </button>
      </div>
    </div>
  );
}

export default Invoice;
