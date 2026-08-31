import React, { useState, useEffect } from 'react';
import { franchiseGetProductSales } from '../../../api/managementService';
import Swal from 'sweetalert2';
import './FranchiseStyles.css';

function FranchiseSalesReport() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await franchiseGetProductSales();
      if (res.success) {
        setSales(res.report);
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load sales report' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="franchise-container">
      <h2 className="franchise-title">Product Sales & Delivery Report</h2>
      <div className="franchise-card">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-responsive">
            <table className="franchise-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Order No</th>
                  <th>Date</th>
                  <th>Buyer ID</th>
                  <th>Buyer Name</th>
                  <th>Contact</th>
                  <th>Items Delivered</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.length > 0 ? (
                  sales.map(sale => (
                    <tr key={sale.orderNo}>
                      <td>{sale.id}</td>
                      <td>{sale.orderNo}</td>
                      <td>{sale.orderDate}</td>
                      <td>{sale.buyerId}</td>
                      <td>{sale.buyerName}</td>
                      <td>{sale.buyerContact}</td>
                      <td>{sale.items}</td>
                      <td>₹{sale.totalPrice}</td>
                      <td>
                        <span className="franchise-status-badge success">
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center' }}>No sales records found.</td>
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

export default FranchiseSalesReport;
