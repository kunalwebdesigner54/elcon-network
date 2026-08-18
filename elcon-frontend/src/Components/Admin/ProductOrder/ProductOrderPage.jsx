import { useEffect, useMemo, useState } from 'react';
import '../Common/AdminLayout.css';
import './ProductOrder.css';
import { getAdminOrders, updateOrderStatus } from '../../../api/productsService';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const response = await getAdminOrders();
      setOrders(response.orders || []);
    } catch (error) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesPageStatus = !statusFilter || order.orderStatus === statusFilter;
      const matchesOrderNo = !filters.orderNo || String(order.orderNo || '').toLowerCase().includes(filters.orderNo.toLowerCase());
      const matchesMemberId = !filters.memberId || String(order.memberId || '').toLowerCase().includes(filters.memberId.toLowerCase());
      const matchesTotalPaid = !filters.totalPaid || String(order.totalPaid || '').includes(filters.totalPaid);
      const matchesLvPoint = !filters.lvPoint || String(order.lvPoint || '').includes(filters.lvPoint);
      const matchesBvPoint = !filters.bvPoint || String(order.bvPoint || '').includes(filters.bvPoint);
      const matchesStatus = !filters.status || order.orderStatus === filters.status;
      return matchesPageStatus && matchesOrderNo && matchesMemberId && matchesTotalPaid && matchesLvPoint && matchesBvPoint && matchesStatus;
    });
  }, [filters, orders, statusFilter]);

  const limit = Number(filters.limit) || 10;
  const totalFilteredPages = Math.max(1, Math.ceil(filteredOrders.length / limit));
  const safePage = Math.min(currentPage, totalFilteredPages);
  const startIndex = (safePage - 1) * limit;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + limit);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleStatusUpdate = async (orderNo, nextStatus) => {
    await updateOrderStatus(orderNo, { orderStatus: nextStatus });
    await loadOrders();
  };

  const badgeClass = statusToClass[statusFilter] || 'status-pending';

  return (
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
          <button type="button" className="admin-product-order-search-btn">SEARCH</button>
        </div>

        <div className="admin-product-order-table-wrapper">
          <table className="admin-product-order-table">
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
                    <button type="button" className="admin-product-order-action-link">Details</button>
                    {renderActions(order, handleStatusUpdate)}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="16">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-product-order-table-footer">
          <div>Showing {paginatedOrders.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + limit, filteredOrders.length)} of {filteredOrders.length} entries</div>
          <div className="admin-product-order-pagination">
            <button type="button" className="admin-product-order-page-btn" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={safePage === 1}>❮</button>
            <button type="button" className="admin-product-order-page-btn" onClick={() => setCurrentPage(1)} disabled={safePage === 1}>⟨⟨</button>
            {Array.from({ length: Math.min(7, totalFilteredPages) }, (_, index) => {
              const page = index + 1;
              return <button key={page} type="button" className={`admin-product-order-page-btn ${safePage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>;
            })}
            <button type="button" className="admin-product-order-page-btn" onClick={() => setCurrentPage(totalFilteredPages)} disabled={safePage === totalFilteredPages}>⟩⟩</button>
            <button type="button" className="admin-product-order-page-btn" onClick={() => setCurrentPage((page) => Math.min(totalFilteredPages, page + 1))} disabled={safePage === totalFilteredPages}>❯</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductOrderPage;