import ProductOrderPage from '../ProductOrderPage';

const renderActions = (order, updateStatus) => {
  if (order.orderStatus === 'Pending') {
    return (
      <>
        <button type="button" className="admin-product-order-action-btn action-btn-confirm" onClick={() => updateStatus(order.orderNo, 'Confirm')}>
          Confirm
        </button>
        <button type="button" className="admin-product-order-action-btn action-btn-cancel" onClick={() => updateStatus(order.orderNo, 'Cancelled')}>
          Cancel
        </button>
      </>
    );
  }

  if (order.orderStatus === 'Confirm') {
    return (
      <>
        <button type="button" className="admin-product-order-action-btn action-btn-process" onClick={() => updateStatus(order.orderNo, 'Processing')}>
          Processing
        </button>
        <button type="button" className="admin-product-order-action-btn action-btn-cancel" onClick={() => updateStatus(order.orderNo, 'Cancelled')}>
          Cancel
        </button>
      </>
    );
  }

  if (order.orderStatus === 'Processing') {
    return (
      <>
        <button type="button" className="admin-product-order-action-btn action-btn-dispatch" onClick={() => updateStatus(order.orderNo, 'Dispatch')}>
          Dispatch
        </button>
        <button type="button" className="admin-product-order-action-btn action-btn-cancel" onClick={() => updateStatus(order.orderNo, 'Cancelled')}>
          Cancel
        </button>
      </>
    );
  }

  if (order.orderStatus === 'Dispatch') {
    return (
      <>
        <button type="button" className="admin-product-order-action-btn action-btn-confirm" onClick={() => updateStatus(order.orderNo, 'Delivered')}>
          Delivered
        </button>
        <button type="button" className="admin-product-order-action-btn action-btn-return" onClick={() => updateStatus(order.orderNo, 'Returned')}>
          Return
        </button>
      </>
    );
  }

  if (order.orderStatus === 'Delivered') {
    return (
      <button type="button" className="admin-product-order-action-btn action-btn-return" onClick={() => updateStatus(order.orderNo, 'Returned')}>
        Return
      </button>
    );
  }

  if (order.orderStatus === 'Returned') {
    return (
      <>
        <button type="button" className="admin-product-order-action-btn action-btn-confirm" onClick={() => updateStatus(order.orderNo, 'Delivered')}>
          Delivered
        </button>
        <button type="button" className="admin-product-order-action-btn action-btn-cancel" onClick={() => updateStatus(order.orderNo, 'Cancelled')}>
          Cancel
        </button>
      </>
    );
  }

  return (
    <button type="button" className="admin-product-order-action-btn action-btn-cancel" disabled>
      Cancelled
    </button>
  );
};

export default function AllOrders() {
  return <ProductOrderPage title="All Orders" renderActions={renderActions} />;
}
