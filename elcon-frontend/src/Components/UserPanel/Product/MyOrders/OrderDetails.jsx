import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../Common/UserLayout.css';
import './OrderDetails.css';
import { getOrderByNo } from '../../../../api/productsService';
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

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await getOrderByNo(orderNo);
        setOrder(response.order);
      } catch (error) {
        setOrder(null);
      }
    };

    loadOrder();
  }, [orderNo]);

  const fallbackOrder = useMemo(() => ({
    orderNo,
    orderDate: '23-04-2026 04.36 PM',
    paymentMode: 'E-wallet',
    orderItems: 0,
    orderStatus: 'Pending',
    paymentStatus: 'Paid',
    totalPrice: 0,
    shippingCharge: 0,
    discountCoupon: 0,
    finalTotal: 0,
    shippingInformation: [],
    items: [],
  }), [orderNo]);

  const activeOrder = order || fallbackOrder;

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

        <section className="order-details-items-card">
          <div className="order-details-table-wrap">
            <table className="order-details-items-table">
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
                        <span className="order-details-item-name">{item.name}</span>
                      </div>
                    </td>
                    <td data-label="Price">{item.price.toFixed(2)}</td>
                    <td data-label="Quantity">{item.quantity}</td>
                    <td data-label="Total Price">{item.totalPrice.toFixed(2)}</td>
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