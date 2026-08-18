import ProductOrderPage from '../ProductOrderPage';

const renderActions = (order, updateStatus) => (
  <button type="button" className="admin-product-order-action-btn action-btn-return" onClick={() => updateStatus(order.orderNo, 'Returned')}>
    Return
  </button>
);

export default function DeliveredOrders() {
  return <ProductOrderPage title="Delivered Orders" statusFilter="Delivered" renderActions={renderActions} />;
}
