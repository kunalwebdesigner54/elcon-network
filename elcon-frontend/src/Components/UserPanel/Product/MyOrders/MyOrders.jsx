import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Common/UserLayout.css';
import './MyOrders.css';
import { getOrders } from '../../../../api/productsService';

function DetailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 13h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 9h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="4" y="4" width="16" height="16" rx="2.5" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

function getStatusClass(status) {
  switch (String(status || '').toUpperCase()) {
    case 'PENDING':
      return 'order-status order-status--pending';
    case 'CONFIRMED':
      return 'order-status order-status--confirmed';
    case 'PROCESSING':
      return 'order-status order-status--processing';
    case 'DISPATCHED':
      return 'order-status order-status--dispatched';
    case 'DELIVERED':
      return 'order-status order-status--delivered';
    case 'RETURNED':
      return 'order-status order-status--returned';
    case 'CANCELLED':
      return 'order-status order-status--cancelled';
    default:
      return 'order-status';
  }
}

function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await getOrders();
        setOrders(response.orders || []);
      } catch (error) {
        setOrders([]);
      }
    };

    loadOrders();
  }, []);

  const openOrderDetails = (orderNo) => {
    navigate(`/user/product/my-orders/details/${orderNo}`);
  };

  return (
    <div className="user-orders-page">
      <div className="user-orders-shell">
      

        <section className="user-orders-card">
          <h1 className="user-orders-title">My Orders</h1>

          <div className="table-wrap user-orders-table-wrap">
            <table className="user-table user-orders-table">
              <thead>
                <tr>
                  <th>S. NO</th>
                  <th>ORDER NO</th>
                  <th>ORDER DATE</th>
                  <th>ITEMS</th>
                  <th>TOTAL PAID</th>
                  <th>PAY MODE</th>
                  <th>PAY STATUS</th>
                  <th>ORDER STATUS</th>
                  <th>DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {orders.length ? orders.map((order, index) => (
                  <tr key={order.orderNo}>
                    <td data-label="S. NO">{index + 1}</td>
                    <td data-label="ORDER NO">{order.orderNo}</td>
                    <td data-label="ORDER DATE">{order.orderDate}</td>
                    <td data-label="ITEMS">{order.items}</td>
                    <td data-label="TOTAL PAID">{Number(order.totalPaid ?? order.finalTotal ?? order.totalPrice ?? 0).toFixed(2)}</td>
                    <td data-label="PAY MODE">{order.payMode ?? order.paymentMode}</td>
                    <td data-label="PAY STATUS">{order.payStatus ?? order.paymentStatus}</td>
                    <td data-label="ORDER STATUS" className={getStatusClass(order.orderStatus)}>
                      {order.orderStatus}
                    </td>
                    <td data-label="DETAILS" className="user-order-detail-cell">
                      <button
                        type="button"
                        className="user-order-detail-btn"
                        onClick={() => openOrderDetails(order.orderNo)}
                        aria-label={`View details for ${order.orderNo}`}
                      >
                        <DetailIcon />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center' }}>No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default MyOrders;
