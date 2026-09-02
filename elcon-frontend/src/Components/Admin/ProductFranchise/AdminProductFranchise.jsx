import React, { useState, useEffect } from 'react';
import { adminAssignProductStock, adminGetProductStocks, getEpinFranchises } from '../../../api/managementService';
import { getAdminProducts as getProducts } from '../../../api/productsService';
import Swal from 'sweetalert2';
import './AdminProductFranchise.css';

function AdminProductFranchise() {
  const [franchises, setFranchises] = useState([]);
  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    franchiseId: '',
    productId: '',
    quantity: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [franchiseRes, productsRes, stocksRes] = await Promise.all([
        getEpinFranchises(),
        getProducts(),
        adminGetProductStocks()
      ]);

      if (franchiseRes.success) setFranchises(franchiseRes.franchises || []);
      if (productsRes.success) setProducts(productsRes.products || []);
      if (stocksRes.success) setStocks(stocksRes.stocks || []);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.franchiseId || !formData.productId || !formData.quantity) {
      return Swal.fire({ icon: 'warning', title: 'Warning', text: 'All fields are required.' });
    }

    try {
      const res = await adminAssignProductStock(formData);
      if (res.success) {
        Swal.fire({ icon: 'success', title: 'Success', text: res.message });
        setFormData({ ...formData, quantity: '' });
        fetchInitialData(); // refresh stocks
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: res.message });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error assigning stock' });
    }
  };

  return (
    <div className="admin-product-franchise-container">
      <h2 className="admin-product-franchise-title">Manage Product Franchise Stock</h2>

      <div className="admin-product-franchise-form-card">
        <h3>Assign Stock to Franchise</h3>
        <form onSubmit={handleSubmit} className="admin-product-franchise-form">
          <div className="form-group">
            <label>Franchise Member</label>
            <select name="franchiseId" value={formData.franchiseId} onChange={handleInputChange} required>
              <option value="">Select Franchise</option>
              {(Array.isArray(franchises) ? franchises : []).map(f => (
                <option key={f?._id || Math.random()} value={f?.franchiseId}>{f?.name || f?.franchiseName} ({f?.franchiseId})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Product</label>
            <select name="productId" value={formData.productId} onChange={handleInputChange} required>
              <option value="">Select Product</option>
              {(Array.isArray(products) ? products : []).map(p => (
                <option key={p?._id || Math.random()} value={p?._id}>{p?.productName} ({p?.productCode})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} min="1" required />
          </div>

          <button type="submit" className="admin-product-franchise-submit-btn">Assign Stock</button>
        </form>
      </div>

      <div className="admin-product-franchise-table-card">
        <h3>Current Franchise Stock</h3>
        {loading ? (
          <p>Loading stocks...</p>
        ) : (
          <div className="table-responsive">
            <table className="admin-product-franchise-table">
              <thead>
                <tr>
                  <th>Franchise ID</th>
                  <th>Franchise Name</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock Quantity</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(stocks) && stocks.length > 0 ? (
                  stocks.map((stock) => (
                    <tr key={stock?._id || Math.random()}>
                      <td>{stock?.franchiseId}</td>
                      <td>{stock?.franchiseName}</td>
                      <td>{stock?.productName}</td>
                      <td>{stock?.type}</td>
                      <td style={{ fontWeight: 'bold', color: (stock?.quantity || 0) > 0 ? 'green' : 'red' }}>
                        {stock?.quantity || 0}
                      </td>
                      <td>{stock?.updatedAt ? new Date(stock.updatedAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>No stock data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProductFranchise;
