import ProductOrderPage from '../ProductOrderPage';

const renderActions = (order, updateStatus) => (
  <>
    <button type="button" className="admin-product-order-action-btn action-btn-confirm" onClick={() => updateStatus(order.orderNo, 'Delivered')}>
      Delivered
    </button>
    <button type="button" className="admin-product-order-action-btn action-btn-cancel" onClick={() => updateStatus(order.orderNo, 'Cancelled')}>
      Cancel
    </button>
  </>
);

export default function ReturnedOrders() {
  return <ProductOrderPage title="Returned Orders" statusFilter="Returned" renderActions={renderActions} />;
}
