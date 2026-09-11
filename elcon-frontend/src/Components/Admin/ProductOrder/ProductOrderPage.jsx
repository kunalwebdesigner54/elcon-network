import { useEffect, useMemo, useState } from 'react';
import '../Common/AdminLayout.css';
import './ProductOrder.css';
import { getAdminOrders, updateOrderStatus, getOrderByNo } from '../../../api/productsService';

const defaultFilters = {
  orderNo: '',
  memberId: '',
  totalPaid: '',
  lvPoint: '',
  bvPoint: '',
  status: '',
  startDate: '',
  endDate: '',
  limit: '10',
};

const statusToClass = {
  Pending: 'status-pending',
  Confirm: 'status-confirm',
  Processing: 'status-processing',
  Dispatch: 'status-dispatch',
  Delivered: 'status-delivered',
  Returned: 'status-returned',
  Cancelled: 'status-cancelled',
};

function ProductOrderPage({ title, statusFilter, renderActions }) {
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await getAdminOrders({
        ...filters,
        page: currentPage,
        status: statusFilter || filters.status
      });
      setOrders(response.orders || []);
      setTotalOrders(response.total || 0);
    } catch (error) {
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter, filters.limit]);

  const handleSearch = () => {
    if (currentPage === 1) {
      loadOrders();
    } else {
      setCurrentPage(1);
    }
  };

  const handleViewDetails = async (orderNo) => {
    setDetailsLoading(true);
    try {
      const response = await getOrderByNo(orderNo);
      setSelectedOrder(response.order);
    } catch (error) {
      window.alert('Failed to load order details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedOrder(null);
  };

  const handleExportXLS = async () => {
    try {
      const response = await getAdminOrders({
        ...filters,
        status: statusFilter || filters.status,
        exportData: 'true'
      });
      const exportOrders = response.orders || [];

      const exportData = exportOrders.map((order, index) => ({
        'S. No': index + 1,
        'Order No': order.orderNo,
        'Member Id': order.memberId,
        'Order Date': order.orderDate,
        'Items': order.items,
        'Total Paid': Number(order.totalPaid || 0).toFixed(2),
        'Pay Mode': order.payMode,
        'Pay Status': order.payStatus,
        'LV Point': order.lvPoint,
        'BV Point': order.bvPoint,
        'Order Status': order.orderStatus,
        'Start Date': order.startDate,
        'End Date': order.endDate,
      }));

      if (exportData.length === 0) {
        window.alert('No data to export');
        return;
      }

      // Create CSV content
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch(err) {
      window.alert('Export failed');
    }
  };

  const handleExportDetailedXLS = async () => {
    // Export with full item details (size, color)
    setDetailsLoading(true);
    try {
      const resp = await getAdminOrders({
        ...filters,
        status: statusFilter || filters.status,
        exportData: 'true'
      });
      const exportOrders = resp.orders || [];
      const allOrderDetails = [];
      
      for (const order of exportOrders) {
        try {
          const response = await getOrderByNo(order.orderNo);
          const orderDetail = response.order;
          
          if (orderDetail.items && orderDetail.items.length > 0) {
            orderDetail.items.forEach((item) => {
              allOrderDetails.push({
                'Order No': orderDetail.orderNo,
                'Order Date': orderDetail.orderDate,
                'Member Id': orderDetail.memberId,
                'Order Status': orderDetail.orderStatus,
                'Payment Mode': orderDetail.paymentMode,
                'Payment Status': orderDetail.paymentStatus,
                'Product Name': item.name || '',
                'Product Code': item.productCode || '',
                'Quantity': item.quantity || 1,
                'Price': Number(item.price || 0).toFixed(2),
                'Total Price': Number(item.totalPrice || 0).toFixed(2),
                'Size': item.selectedSize || '-',
                'Color': item.selectedColor || '-',
              });
            });
          } else {
            // Order without items
            allOrderDetails.push({
              'Order No': orderDetail.orderNo,
              'Order Date': orderDetail.orderDate,
              'Member Id': orderDetail.memberId,
              'Order Status': orderDetail.orderStatus,
              'Payment Mode': orderDetail.paymentMode,
              'Payment Status': orderDetail.paymentStatus,
              'Product Name': 'No items',
              'Product Code': '',
              'Quantity': '',
              'Price': '',
              'Total Price': '',
              'Size': '',
              'Color': '',
            });
          }
        } catch (err) {
          console.error(`Failed to fetch details for order ${order.orderNo}`, err);
        }
      }

      if (allOrderDetails.length === 0) {
        window.alert('No data to export');
        return;
      }

      const headers = Object.keys(allOrderDetails[0]);
      const csvContent = [
        headers.join(','),
        ...allOrderDetails.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `orders-detailed-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      window.alert(`Exported ${allOrderDetails.length} order items with size/color details`);
    } catch (error) {
      window.alert('Failed to export detailed data');
    } finally {
      setDetailsLoading(false);
    }
  };

  const limit = Number(filters.limit) || 10;
  const totalFilteredPages = Math.max(1, Math.ceil(totalOrders / limit));
  const safePage = Math.min(currentPage, totalFilteredPages);
  const startIndex = (safePage - 1) * limit;
  const paginatedOrders = orders;

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusUpdate = async (orderNo, nextStatus) => {
    await updateOrderStatus(orderNo, { orderStatus: nextStatus });
    await loadOrders();
  };

  const badgeClass = statusToClass[statusFilter] || 'status-pending';

  return (
    <>
      <div className="admin-product-order-container">
        <h2 className="admin-product-order-title">{title}</h2>
        <section className="admin-product-order-panel">
          <div className="admin-product-order-filter-row">
            <input className="admin-product-order-input admin-product-order-input-order-no" name="orderNo" placeholder="ORDER NO" value={filters.orderNo} onChange={handleFilterChange} />
            <input className="admin-product-order-input admin-product-order-input-member-id" name="memberId" placeholder="MEMBER ID" value={filters.memberId} onChange={handleFilterChange} />
            <input className="admin-product-order-input admin-product-order-input-total-paid" name="totalPaid" placeholder="TOTAL PAID" value={filters.totalPaid} onChange={handleFilterChange} />
            <input className="admin-product-order-input admin-product-order-input-lv-point" name="lvPoint" placeholder="LV POINT" value={filters.lvPoint} onChange={handleFilterChange} />
            <input className="admin-product-order-input admin-product-order-input-bv-point" name="bvPoint" placeholder="BV POINT" value={filters.bvPoint} onChange={handleFilterChange} />
            <select className="admin-product-order-input admin-product-order-input-status" name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">STATUS</option>
              <option value="Pending">PENDING</option>
              <option value="Confirm">CONFIRM</option>
              <option value="Processing">PROCESSING</option>
              <option value="Dispatch">DISPATCH</option>
              <option value="Delivered">DELIVERED</option>
              <option value="Returned">RETURNED</option>
              <option value="Cancelled">CANCELLED</option>
            </select>
            <input type="date" className="admin-product-order-input admin-product-order-input-date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
            <input type="date" className="admin-product-order-input admin-product-order-input-date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
            <select className="admin-product-order-input admin-product-order-input-limit" name="limit" value={filters.limit} onChange={handleFilterChange}>
              <option value="10">10</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <button type="button" className="admin-product-order-search-btn" onClick={handleSearch}>SEARCH</button>
          </div>

          <div className="btn-row admin-product-order-export-row" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '14px' }}>
            <button type="button" className="btn-outline admin-product-order-export-btn" style={{ minWidth: '72px', padding: '6px 12px', fontSize: '13px', fontWeight: '600', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }} onClick={handleExportXLS}>XLS (Summary)</button>
            <button type="button" className="btn-outline admin-product-order-export-btn" style={{ minWidth: '100px', padding: '6px 12px', fontSize: '13px', fontWeight: '600', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }} onClick={handleExportDetailedXLS}>XLS (Detailed + Size/Color)</button>
            <button type="button" className="btn-outline admin-product-order-export-btn" style={{ minWidth: '72px', padding: '6px 12px', fontSize: '13px', fontWeight: '600', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}>PDF</button>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>S. No</th>
                  <th>Order No</th>
                  <th>Member Id</th>
                  <th>Order Date</th>
                  <th>Items</th>
                  <th>Total Paid</th>
                  <th>Pay Mode</th>
                  <th>Pay Status</th>
                  <th>LV Point</th>
                  <th>BV Point</th>
                  <th>Order Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Invoice</th>
                  <th>Ship. Label</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="16">Loading...</td></tr>
                ) : paginatedOrders.length ? paginatedOrders.map((order, index) => (
                  <tr key={order.orderNo}>
                    <td className="text-center">{startIndex + index + 1}</td>
                    <td>{order.orderNo}</td>
                    <td>{order.memberId}</td>
                    <td>{order.orderDate}</td>
                    <td className="text-center">{order.items}</td>
                    <td className="text-center">₹{Number(order.totalPaid || 0).toFixed(2)}</td>
                    <td>{order.payMode}</td>
                    <td className="text-center">{order.payStatus}</td>
                    <td className="text-center">{order.lvPoint}</td>
                    <td className="text-center">{order.bvPoint}</td>
                    <td><span className={`admin-product-order-status-badge ${badgeClass}`}>{statusFilter || order.orderStatus}</span></td>
                    <td>{order.startDate}</td>
                    <td>{order.endDate}</td>
                    <td className="admin-product-order-action-cell"><button type="button" className="admin-product-order-action-btn action-btn-invoice">Invoice</button></td>
                    <td className="admin-product-order-action-cell"><button type="button" className="admin-product-order-action-btn action-btn-ship">Ship</button></td>
                    <td className="admin-product-order-action-cell">
                      <button type="button" className="admin-product-order-action-link" onClick={() => handleViewDetails(order.orderNo)}>Details</button>
                      {renderActions(order, handleStatusUpdate)}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="16">No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <div>Showing {paginatedOrders.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + limit, totalOrders)} of {totalOrders} entries</div>
            <div className="pagination">
              <button type="button" className="page-btn" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={safePage <= 1}>❮</button>
              <button type="button" className="page-btn" onClick={() => setCurrentPage(1)} disabled={safePage <= 1}>⟨⟨</button>
              {Array.from({ length: Math.min(7, totalFilteredPages) }, (_, index) => {
                // simple pagination view centered around current page
                let startPage = Math.max(1, safePage - 3);
                if (startPage + 6 > totalFilteredPages) {
                  startPage = Math.max(1, totalFilteredPages - 6);
                }
                const page = startPage + index;
                if (page > totalFilteredPages) return null;
                return <button key={page} type="button" className={`page-btn ${safePage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>;
              })}
              <button type="button" className="page-btn" onClick={() => setCurrentPage(totalFilteredPages)} disabled={safePage >= totalFilteredPages || totalFilteredPages === 0}>⟩⟩</button>
              <button type="button" className="page-btn" onClick={() => setCurrentPage((page) => Math.min(totalFilteredPages, page + 1))} disabled={safePage >= totalFilteredPages || totalFilteredPages === 0}>❯</button>
            </div>
          </div>
        </section>
      </div>
      <OrderDetailsModal order={selectedOrder} onClose={closeDetails} loading={detailsLoading} />
    </>
  );
}

// Order Details Modal
const OrderDetailsModal = ({ order, onClose, loading }) => {
  if (!order) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '95%', maxHeight: '85vh', overflow: 'auto' }}>
        <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--glass-border)' }}>
          <h3 style={{ margin: 0 }}>Order Details - {order.orderNo}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose} style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}>&times;</button>
        </div>
        <div className="admin-modal-form" style={{ padding: '20px' }}>
          {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Loading order details...</div>}
          
          {!loading && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Order No</label>
                  <span style={{ fontWeight: '600' }}>{order.orderNo}</span>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Order Date</label>
                  <span>{order.orderDate}</span>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Member ID</label>
                  <span>{order.memberId}</span>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Payment Mode</label>
                  <span>{order.paymentMode}</span>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Order Status</label>
                  <span style={{ textTransform: 'capitalize' }}>{order.orderStatus}</span>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Payment Status</label>
                  <span>{order.paymentStatus}</span>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Shipping Address</label>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', fontSize: '14px', whiteSpace: 'pre-line' }}>
                  {order.shippingInformation?.map((field) => `${field.label}: ${field.value}`).join('\n') || 'No address'}
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: '12px', color: '#fff' }}>Order Items ({order.items.length})</h4>
                  <div className="table-wrap" style={{ maxHeight: '400px', overflow: 'auto' }}>
                    <table className="data-table" style={{ minWidth: '800px' }}>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th style={{ textAlign: 'center' }}>Qty</th>
                          <th style={{ textAlign: 'right' }}>Price</th>
                          <th style={{ textAlign: 'right' }}>Total</th>
                          <th>Size</th>
                          <th>Color</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, idx) => (
                          <tr key={`${item.name}-${idx}`}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {item.imageKey && (
                                  <img src={item.imageKey} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                )}
                                <span>{item.name}</span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ textAlign: 'right' }}>₹{Number(item.price || 0).toFixed(2)}</td>
                            <td style={{ textAlign: 'right', fontWeight: '600' }}>₹{Number(item.totalPrice || 0).toFixed(2)}</td>
                            <td style={{ textAlign: 'center' }}><span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>{item.selectedSize || '-'}</span></td>
                            <td style={{ textAlign: 'center' }}><span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>{item.selectedColor || '-'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#888' }}>Total Amount</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>₹{Number(order.finalTotal || 0).toFixed(2)}</div>
                </div>
                <button type="button" className="admin-btn-primary" onClick={onClose} style={{ padding: '10px 24px' }}>Close</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductOrderPage;
