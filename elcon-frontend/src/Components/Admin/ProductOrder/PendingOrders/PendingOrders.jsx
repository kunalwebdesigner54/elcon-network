import ProductOrderPage from '../ProductOrderPage';

const renderActions = (order, updateStatus) => (
  <>
    <button type="button" className="admin-product-order-action-btn action-btn-confirm" onClick={() => updateStatus(order.orderNo, 'Confirm')}>
      Confirm
    </button>
    <button type="button" className="admin-product-order-action-btn action-btn-cancel" onClick={() => updateStatus(order.orderNo, 'Cancelled')}>
      Cancel
    </button>
  </>
);

export default function PendingOrders() {
  return <ProductOrderPage title="Pending Orders" statusFilter="Pending" renderActions={renderActions} />;
}
