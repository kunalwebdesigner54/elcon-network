import ProductOrderPage from '../ProductOrderPage';

const renderActions = (order, updateStatus) => (
  <>
    <button type="button" className="admin-product-order-action-btn action-btn-confirm" onClick={() => updateStatus(order.orderNo, 'Delivered')}>
      Delivered
    </button>
    <button type="button" className="admin-product-order-action-btn action-btn-return" onClick={() => updateStatus(order.orderNo, 'Returned')}>
      Return
    </button>
  </>
);

export default function DispatchedOrders() {
  return <ProductOrderPage title="Dispatched Orders" statusFilter="Dispatch" renderActions={renderActions} />;
}
