import '../../Common/AdminLayout.css';
import './JoiningPackageAdmin.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminProducts, deleteAdminProduct } from '../../../../api/productsService';

function JoiningPackageAdmin() {
  const navigate = useNavigate();
  const [joiningPackageRows, setJoiningPackageRows] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await getAdminProducts('joining');
        setJoiningPackageRows(response.products || []);
      } catch (error) {
        setJoiningPackageRows([]);
      }
    };

    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteAdminProduct(id);
        const response = await getAdminProducts('joining');
        setJoiningPackageRows(response.products || []);
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product.");
      }
    }
  };

  return (
    <div>
      <section className="panel admin-products-panel">
        <h2 className="section-title admin-products-section-title">JOINING PACKAGE</h2>

        <div className="admin-products-filter-row">
          <input className="text-input admin-products-input admin-products-input-name" placeholder="PRODUCT NAME" />
          <input className="text-input admin-products-input admin-products-input-category" placeholder="CATEGORY" />
          <input className="text-input admin-products-input admin-products-input-hsn" placeholder="HSN/CODE" />
          <select className="select-input admin-products-input admin-products-input-status" defaultValue="status">
            <option value="status">STATUS</option>
            <option value="showing">SHOWING</option>
            <option value="hiden">HIDEN</option>
          </select>
          <select className="select-input admin-products-input admin-products-input-limit" defaultValue="100">
            <option value="100">100</option>
            <option value="50">50</option>
            <option value="10">10</option>
          </select>
          <div className="admin-products-filter-actions">
            <button type="button" className="btn-primary admin-products-search-btn">
              Search
            </button>
            <button
              type="button"
              className="btn-primary admin-add-new-btn"
              onClick={() => navigate('/products-package/Joining-Package/add-new')}
            >
              ADD NEW
            </button>
          </div>
          <div className="admin-products-export-icons" aria-label="export-controls">
            <button type="button" title="Export Excel">
              XLS
            </button>
            <button type="button" title="Export PDF">
              PDF
            </button>
          </div>
        </div>

        <div className="table-wrap admin-products-table-wrap">
          <table className="data-table admin-products-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>PKG CODE</th>
                <th>PACKAGE NAME</th>
                <th>IMAGE</th>
                <th>CATEGORY</th>
                <th>HSN/CODE</th>
                <th>M.R.P</th>
                <th>DP PRICE</th>
                <th>COUPON</th>
                <th>GST(%)</th>
                <th>SHIPPING</th>
                <th>LEVEL POINT</th>
                <th>STOCK</th>
                <th>ACTION</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {joiningPackageRows.map((row, index) => (
                <tr key={row.id || row.productCode}>
                  <td>{index + 1}</td>
                  <td>{row.hsnCode ? `PKG${row.hsnCode}` : ''}</td>
                  <td>{row.productName}</td>
                  <td>
                    <span className="admin-products-image-placeholder">IMG</span>
                  </td>
                  <td>{row.category}</td>
                  <td>{row.hsnCode}</td>
                  <td>{row.mrp}</td>
                  <td>{row.dpPrice}</td>
                  <td>{row.discount}</td>
                  <td>{row.gst}</td>
                  <td>{row.shipping}</td>
                  <td>{row.levelPlan}</td>
                  <td>{row.quantity}</td>
                  <td>
                    <div className="kyc-action-group" style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button className="kyc-action-btn kyc-action-cyan" aria-label="View" title="View" onClick={() => navigate('/products-package/Joining-Package/add-new', { state: { product: row, mode: 'view' } })}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                      <button className="kyc-action-btn kyc-action-green" aria-label="Edit" title="Edit" onClick={() => navigate('/products-package/Joining-Package/add-new', { state: { product: row, mode: 'edit' } })}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button className="kyc-action-btn kyc-action-red" aria-label="Delete" title="Delete" onClick={() => handleDelete(row.id || row.productId || row.productCode)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer admin-products-table-footer">
          <div className="pagination">
            <button className="page-btn">&laquo;</button>
            <button className="page-btn">&lsaquo;</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">4</button>
            <button className="page-btn">5</button>
            <button className="page-btn">&rsaquo;</button>
            <button className="page-btn">&raquo;</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default JoiningPackageAdmin;

