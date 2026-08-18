import ProductOrderPage from '../ProductOrderPage';

const renderActions = (order, updateStatus) => (
  <>
    <button type="button" className="admin-product-order-action-btn action-btn-process" onClick={() => updateStatus(order.orderNo, 'Processing')}>
      Processing
    </button>
    <button type="button" className="admin-product-order-action-btn action-btn-cancel" onClick={() => updateStatus(order.orderNo, 'Cancelled')}>
      Cancel
    </button>
  </>
);

export default function ConfirmOrders() {
  return <ProductOrderPage title="Confirm Orders" statusFilter="Confirm" renderActions={renderActions} />;
}
