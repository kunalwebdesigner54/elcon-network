import ProductOrderPage from '../ProductOrderPage';

const renderActions = () => (
  <button type="button" className="admin-product-order-action-btn action-btn-cancel" disabled>
    Cancelled
  </button>
);

export default function CancelledOrders() {
  return <ProductOrderPage title="Cancelled Orders" statusFilter="Cancelled" renderActions={renderActions} />;
}
