import '../../Common/AdminLayout.css';
import './ShoppingProductsAdmin.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminProducts } from '../../../../api/productsService';

function ShoppingProductsAdmin() {
  const navigate = useNavigate();
  const [shoppingRows, setShoppingRows] = useState([]);

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

  return (
    <div>
      <section className="panel admin-products-panel">
        <h2 className="section-title admin-products-section-title">SHOPPING PRODUCTS</h2>

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
              className="btn-primary admin-products-search-btn"
              onClick={() => navigate('/products-package/shopping-products/add-new')}
            >
              Add New
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
                <th>PRODUCT CODE</th>
                <th>PRODUCT NAME</th>
                <th>IMAGE</th>
                <th>CATEGORY</th>
                <th>HSN/CODE</th>
                <th>M.R.P</th>
                <th>DP PRICE</th>
                <th>DIS(%)</th>
                <th>GST(%)</th>
                <th>SHIPPING</th>
                <th>B.V POINT</th>
                <th>QUANTITY</th>
                <th>ACTION</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {shoppingRows.map((row, index) => (
                <tr key={row.id || row.productCode}>
                  <td>{index + 1}</td>
                  <td>{row.productCode && row.productCode.toUpperCase()}</td>
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
                    <div className="admin-products-action-group">
                      <button type="button" className="admin-products-action-btn show" title="View">
                        O
                      </button>
                      <button type="button" className="admin-products-action-btn edit" title="Edit">
                        E
                      </button>
                      <button type="button" className="admin-products-action-btn delete" title="Delete">
                        X
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

export default ShoppingProductsAdmin;
