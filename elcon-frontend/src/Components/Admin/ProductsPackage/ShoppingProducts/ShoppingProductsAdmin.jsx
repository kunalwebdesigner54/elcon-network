import '../../Common/AdminLayout.css';
import './ShoppingProductsAdmin.css';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminProducts, deleteAdminProduct, updateAdminProduct } from '../../../../api/productsService';
import { resolveProductImage } from '../../../UserPanel/Product/productImages';

function ShoppingProductsAdmin() {
  const navigate = useNavigate();
  const [shoppingRows, setShoppingRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    name: '',
    category: '',
    hsnCode: '',
    status: '',
    limit: '100'
  });
  const [appliedFilters, setAppliedFilters] = useState({
    name: '',
    category: '',
    hsnCode: '',
    status: '',
    limit: '100'
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await getAdminProducts('shopping');
        setShoppingRows(response.products || []);
      } catch (error) {
        setShoppingRows([]);
      }
    };

    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteAdminProduct(id);
        const response = await getAdminProducts('shopping');
        setShoppingRows(response.products || []);
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product.");
      }
    }
  };

  const handleToggleVisibility = async (row) => {
    const currentStatus = row.status?.toUpperCase() || 'SHOWING';
    const newStatus = currentStatus === 'SHOWING' ? 'HIDDEN' : 'SHOWING';
    const id = row._id || row.id || row.productId || row.productCode;

    if (!id) return;

    // Optimistic UI Update for instant feedback
    setShoppingRows(prevRows =>
      prevRows.map(p =>
        (p.id === id || p.productId === id || p.productCode === id || p._id === id)
          ? { ...p, status: newStatus }
          : p
      )
    );

    try {
      await updateAdminProduct(id, { ...row, status: newStatus });
    } catch (error) {
      console.error("Error toggling product status:", error);
      // Revert on failure
      setShoppingRows(prevRows =>
        prevRows.map(p =>
          (p.id === id || p.productId === id || p.productCode === id || p._id === id)
            ? { ...p, status: currentStatus }
            : p
        )
      );
      alert("Failed to update product status.");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const filteredRows = useMemo(() => {
    return shoppingRows.filter(row => {
      const matchName = !appliedFilters.name || row.productName?.toLowerCase().includes(appliedFilters.name.toLowerCase());
      const matchCategory = !appliedFilters.category || row.category?.toLowerCase().includes(appliedFilters.category.toLowerCase());
      const matchHsn = !appliedFilters.hsnCode || row.hsnCode?.toLowerCase().includes(appliedFilters.hsnCode.toLowerCase());
      const matchStatus = !appliedFilters.status || appliedFilters.status === 'status' || (row.status || 'SHOWING').toUpperCase() === appliedFilters.status.toUpperCase();
      return matchName && matchCategory && matchHsn && matchStatus;
    });
  }, [shoppingRows, appliedFilters]);

  const limit = Number(appliedFilters.limit) || 100;
  const totalPages = Math.ceil(filteredRows.length / limit) || 1;
  const visibleRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div>
      <section className="panel admin-products-panel">
        <h2 className="section-title admin-products-section-title">SHOPPING PRODUCTS</h2>

        <div className="admin-products-filter-row">
          <input name="name" value={filters.name} onChange={handleFilterChange} className="text-input admin-products-input admin-products-input-name" placeholder="PRODUCT NAME" />
          <input name="category" value={filters.category} onChange={handleFilterChange} className="text-input admin-products-input admin-products-input-category" placeholder="CATEGORY" />
          <input name="hsnCode" value={filters.hsnCode} onChange={handleFilterChange} className="text-input admin-products-input admin-products-input-hsn" placeholder="HSN/CODE" />
          <select name="status" value={filters.status} onChange={handleFilterChange} className="select-input admin-products-input admin-products-input-status">
            <option value="status">STATUS</option>
            <option value="showing">SHOWING</option>
            <option value="hidden">HIDDEN</option>
          </select>
          <select name="limit" value={filters.limit} onChange={handleFilterChange} className="select-input admin-products-input admin-products-input-limit">
            <option value="100">100</option>
            <option value="50">50</option>
            <option value="10">10</option>
          </select>
          <div className="admin-products-filter-actions">
            <button type="button" className="btn-primary admin-products-search-btn" onClick={handleSearch}>
              Search
            </button>
              <button
                type="button"
                className="btn-primary admin-add-new-btn"
                onClick={() => navigate('/products-package/Shopping-Products/add-new')}
              >
              ADD NEW
              </button>
          </div>
          <div className="admin-products-export-icons" aria-label="export-controls">
            <button type="button" title="Export Excel" className="btn-outline">
              XLS
            </button>
            <button type="button" title="Export PDF" className="btn-outline">
              PDF
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>PRODUCT CODE</th>
                <th>PRODUCT NAME</th>
                <th>IMAGE</th>
                <th>CATEGORY</th>
                <th>HSN/CODE</th>
                <th>M.R.P</th>
                <th>DP PRICE</th>
                <th>Coupon</th>
                <th>GST(%)</th>
                <th>SHIPPING</th>
                <th>B.V POINT</th>
                <th>STOCK</th>
                <th>ACTION</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length > 0 ? visibleRows.map((row, index) => (
                <tr key={row.id || row.productCode || index}>
                  <td>{(currentPage - 1) * limit + index + 1}</td>
                  <td>{row.productCode && row.productCode.toUpperCase()}</td>
                  <td>{row.productName}</td>
                  <td>
                    <img src={resolveProductImage(row)} alt={row.productName} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  </td>
                  <td>{row.category}</td>
                  <td>{row.hsnCode}</td>
                  <td>{row.mrp}</td>
                  <td>{row.dpPrice}</td>
                  <td>{row.discount}</td>
                  <td>{row.gst}</td>
                  <td>{row.shipping}</td>
                  <td>{row.levelPlan || row.levelPoint}</td>
                  <td>{row.quantity}</td>
                  <td>
                      <div className="kyc-action-group" style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button className="kyc-action-btn kyc-action-cyan" aria-label="Toggle Visibility" title={row.status === 'HIDDEN' ? 'Show' : 'Hide'} onClick={() => handleToggleVisibility(row)}>
                        {row.status === 'HIDDEN' ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                      </button>
                      <button className="kyc-action-btn kyc-action-green" aria-label="Edit" title="Edit" onClick={() => navigate('/products-package/shopping-products/add-new', { state: { product: row, mode: 'edit' } })}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button className="kyc-action-btn kyc-action-red" aria-label="Delete" title="Delete" onClick={() => handleDelete(row.id || row.productId || row.productCode)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                  <td>{row.status}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="15" style={{ textAlign: 'center' }}>No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="pagination">
            <button className="page-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>&lsaquo;</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button 
                key={page} 
                className={`page-btn ${currentPage === page ? 'active' : ''}`} 
                onClick={() => goToPage(page)}
                style={currentPage === page ? { background: 'var(--accent-primary)', color: 'white' } : {}}
              >
                {page}
              </button>
            ))}
            <button className="page-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>&rsaquo;</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ShoppingProductsAdmin;

