import ProductOrderPage from '../ProductOrderPage';

const renderActions = (order, updateStatus) => (
  <>
    <button type="button" className="admin-product-order-action-btn action-btn-dispatch" onClick={() => updateStatus(order.orderNo, 'Dispatch')}>
      Dispatch
    </button>
    <button type="button" className="admin-product-order-action-btn action-btn-cancel" onClick={() => updateStatus(order.orderNo, 'Cancelled')}>
      Cancel
    </button>
  </>
);

export default function ProcessingOrders() {
  return <ProductOrderPage title="Processing Orders" statusFilter="Processing" renderActions={renderActions} />;
}
