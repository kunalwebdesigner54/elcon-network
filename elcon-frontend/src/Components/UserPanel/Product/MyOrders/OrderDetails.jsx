import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../Common/UserLayout.css';
import './OrderDetails.css';
import { getOrderByNo, requestFranchiseDelivery } from '../../../../api/productsService';
import { resolveProductImage } from '../productImages';

function PrinterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 9V4h10v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M7 17h10v3H7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      <path d="M6 9h12a2 2 0 0 1 2 2v4h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="5" y="11" width="4" height="3" rx="0.8" fill="currentColor" opacity="0.18" />
    </svg>
  );
}

function getFieldLabel(label) {
  return label;
}

function OrderDetails() {
  const { orderNo } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [franchiseIdInput, setFranchiseIdInput] = useState('');
  const [requestingDelivery, setRequestingDelivery] = useState(false);
  const [deliveryError, setDeliveryError] = useState('');
  const [deliverySuccess, setDeliverySuccess] = useState('');

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await getOrderByNo(orderNo);
        setOrder(response.order);
      } catch (error) {
        setOrder(null);
        setErrorMessage(error?.response?.data?.message || 'Unable to load order details');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderNo]);

  if (loading) {
    return <div className="order-details-page"><div className="order-details-shell">Loading order details...</div></div>;
  }

  if (!order) {
    return (
      <div className="order-details-page">
        <div className="order-details-shell">
          <h1 className="order-details-title">Order Details</h1>
          <p>{errorMessage || 'Order details are unavailable.'}</p>
          <button type="button" className="order-details-print-btn" onClick={handleBackToOrders}>Back to Orders</button>
        </div>
      </div>
    );
  }

  const activeOrder = order;

  // Normalize numeric fields to avoid crashes when backend uses different names
  const totalPrice = Number(activeOrder.totalPrice ?? activeOrder.finalTotal ?? 0);
  const shippingCharge = Number(activeOrder.shippingCharge ?? 0);
  const discountCoupon = Number(activeOrder.discountCoupon ?? 0);
  const finalTotal = Number(activeOrder.finalTotal ?? activeOrder.totalPrice ?? totalPrice);

  const handlePrintInvoice = () => {
    localStorage.setItem('invoiceData', JSON.stringify(activeOrder));
    window.open(`/invoice?orderNo=${activeOrder.orderNo}`, 'Invoice', 'width=900,height=600,scrollbars=yes');
  };

  const handleBackToOrders = () => {
    navigate('/user/product/my-orders');
  };

  const handleRequestFranchiseDelivery = async () => {
    if (!franchiseIdInput.trim()) {
      setDeliveryError('Please enter a Franchise ID.');
      return;
    }
    setRequestingDelivery(true);
    setDeliveryError('');
    setDeliverySuccess('');
    try {
      const response = await requestFranchiseDelivery(activeOrder.orderNo, franchiseIdInput.trim());
      setOrder(response.order);
      setDeliverySuccess('Franchise Direct Delivery requested successfully.');
    } catch (error) {
      setDeliveryError(error?.response?.data?.message || 'Failed to request franchise delivery.');
    } finally {
      setRequestingDelivery(false);
    }
  };

  return (
    <div className="order-details-page">
      <div className="order-details-shell">
        <div className="order-details-toolbar">
          <h1 className="order-details-title">Order Details - {activeOrder.orderNo}</h1>
          <button type="button" className="order-details-print-btn" onClick={handlePrintInvoice}>
            <PrinterIcon />
            <span>Print Invoice</span>
          </button>
        </div>

        <section className="order-details-info-grid">
          <article className="order-details-info-card">
            <div className="order-details-info-card__header">Order Overview</div>
            <div className="order-details-info-list">
              <div className="order-details-info-row">
                <span className="order-details-info-label">Order No</span>
                <span className="order-details-info-value">{activeOrder.orderNo}</span>
              </div>
              <div className="order-details-info-row">
                <span className="order-details-info-label">Order Date</span>
                <span className="order-details-info-value">{activeOrder.orderDate}</span>
              </div>
              <div className="order-details-info-row">
                <span className="order-details-info-label">Payment Mode</span>
                <span className="order-details-info-value">{activeOrder.paymentMode}</span>
              </div>
              <div className="order-details-info-row">
                <span className="order-details-info-label">Order Items</span>
                <span className="order-details-info-value">{activeOrder.orderItems}</span>
              </div>
              <div className="order-details-info-row">
                <span className="order-details-info-label">Order Status</span>
                <span className="order-details-info-value">{activeOrder.orderStatus}</span>
              </div>
              <div className="order-details-info-row">
                <span className="order-details-info-label">Order Payment Status</span>
                <span className="order-details-info-value">{activeOrder.paymentStatus}</span>
              </div>
            </div>
          </article>

          <article className="order-details-info-card">
            <div className="order-details-info-card__header">Order Summary</div>
            <div className="order-details-info-list">
              <div className="order-details-info-row">
                <span className="order-details-info-label">Total Price</span>
                <span className="order-details-info-value">{totalPrice.toFixed(2)}</span>
              </div>
              <div className="order-details-info-row">
                <span className="order-details-info-label">+ Shipping Charge</span>
                <span className="order-details-info-value">+{shippingCharge.toFixed(2)}</span>
              </div>
              <div className="order-details-info-row">
                <span className="order-details-info-label">- Discount Coupon</span>
                <span className="order-details-info-value">{discountCoupon.toFixed(2)}</span>
              </div>
              <div className="order-details-info-row order-details-info-row--total">
                <span className="order-details-info-label">Total</span>
                <span className="order-details-info-value">{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </article>

          <article className="order-details-info-card">
            <div className="order-details-info-card__header">Shipping Information</div>
            <div className="order-details-info-list">
              {activeOrder.shippingInformation.map((field) => (
                <div className="order-details-info-row" key={field.label}>
                  <span className="order-details-info-label">{getFieldLabel(field.label)}</span>
                  <span className="order-details-info-value">{field.value}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        {activeOrder.orderStatus === 'Pending' && (
          <section className="order-details-info-card" style={{ marginTop: '20px', borderLeft: '4px solid var(--primary-color)' }}>
            <div className="order-details-info-card__header">Delivery Options</div>
            <div className="order-details-info-list">
              {activeOrder.deliveryType === 'Franchisee Direct' ? (
                <>
                  <div className="order-details-info-row">
                    <span className="order-details-info-label">Delivery Type</span>
                    <span className="order-details-info-value" style={{ fontWeight: '600' }}>{activeOrder.deliveryType}</span>
                  </div>
                  <div className="order-details-info-row">
                    <span className="order-details-info-label">Franchise ID</span>
                    <span className="order-details-info-value">{activeOrder.franchiseId}</span>
                  </div>
                  <div className="order-details-info-row">
                    <span className="order-details-info-label">Verification Code</span>
                    <span className="order-details-info-value" style={{ fontSize: '1.2rem', letterSpacing: '2px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                      {activeOrder.verificationCode}
                    </span>
                  </div>
                  <div className="order-details-info-row">
                    <span className="order-details-info-label">Verification Status</span>
                    <span className="order-details-info-value">
                      <span className={`status-badge status-${activeOrder.verificationStatus?.toLowerCase()}`}>
                        {activeOrder.verificationStatus}
                      </span>
                    </span>
                  </div>
                  <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                    Please provide the Verification Code to the Franchisee when collecting your products. Do not share it with anyone else.
                  </p>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '10px 0' }}>
                  <p style={{ fontSize: '0.95rem', color: '#444' }}>
                    You can choose to collect your products directly from a Franchisee instead of Company Delivery.
                  </p>
                  {deliveryError && <div className="alert alert-danger" style={{ padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '4px' }}>{deliveryError}</div>}
                  {deliverySuccess && <div className="alert alert-success" style={{ padding: '10px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px' }}>{deliverySuccess}</div>}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="Enter Franchise ID" 
                      value={franchiseIdInput}
                      onChange={(e) => setFranchiseIdInput(e.target.value)}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', flex: 1, maxWidth: '300px' }}
                    />
                    <button 
                      onClick={handleRequestFranchiseDelivery} 
                      disabled={requestingDelivery}
                      style={{ padding: '10px 20px', borderRadius: '4px', border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontWeight: '500' }}
                    >
                      {requestingDelivery ? 'Requesting...' : 'Request Franchise Delivery'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="order-details-items-card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item / Product Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total Price</th>
                </tr>
              </thead>
              <tbody>
                {activeOrder.items.map((item) => (
                  <tr key={item.name}>
                    <td data-label="Item / Product Name">
                      <div className="order-details-item-product">
                        <img className="order-details-item-thumb" src={resolveProductImage(item.imageKey || item.name)} alt={item.name} />
                        <span className="order-details-item-name">
                          {item.name}
                          {(item.selectedSize || item.selectedColor) && (
                            <small>
                              {item.selectedSize ? `Size: ${item.selectedSize}` : ''}
                              {item.selectedSize && item.selectedColor ? ' | ' : ''}
                              {item.selectedColor ? `Color: ${item.selectedColor}` : ''}
                            </small>
                          )}
                        </span>
                      </div>
                    </td>
                    <td data-label="Price">{Number(item.price || 0).toFixed(2)}</td>
                    <td data-label="Quantity">{item.quantity}</td>
                    <td data-label="Total Price">{Number(item.totalPrice || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="order-details-footer">
          <button type="button" className="order-details-back-btn" onClick={handleBackToOrders}>
            Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
