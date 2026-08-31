import React, { useEffect, useState } from 'react';
import '../../Common/AdminLayout.css';
import '../ProductOrder.css';
import { getAdminGstSummary } from '../../../../api/productsService';

function GstSummary() {
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getAdminGstSummary();
        if (data && data.success) {
          setSummaryData(data.summary || []);
        }
      } catch (error) {
        console.error('Error fetching GST Summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="admin-product-order-container">
      <h2 className="admin-product-order-title">GST Sales Summary Table</h2>
      
      <section className="admin-product-order-panel">
        <div className="btn-row admin-product-order-export-row" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '14px' }}>
          <button type="button" className="btn-outline admin-product-order-export-btn" style={{ minWidth: '72px', padding: '6px 12px', fontSize: '13px', fontWeight: '600', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}>XLS</button>
          <button type="button" className="btn-outline admin-product-order-export-btn" style={{ minWidth: '72px', padding: '6px 12px', fontSize: '13px', fontWeight: '600', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}>PDF</button>
        </div>

        <div className="admin-product-order-table-wrapper">
          <table className="admin-product-order-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Orders</th>
                <th>Total Quantity Sold</th>
                <th>Taxable Sales (₹)</th>
                <th>CGST (₹)</th>
                <th>SGST (₹)</th>
                <th>IGST (₹)</th>
                <th>Total GST (₹)</th>
                <th>Gross Sales (₹)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center">Loading...</td>
                </tr>
              ) : summaryData.length > 0 ? (
                summaryData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.month || '-'}</td>
                    <td className="text-center">{row.totalOrders || 0}</td>
                    <td className="text-center">{row.totalQuantitySold || 0}</td>
                    <td className="text-center">₹{Number(row.taxableSales || 0).toFixed(2)}</td>
                    <td className="text-center">₹{Number(row.cgst || 0).toFixed(2)}</td>
                    <td className="text-center">₹{Number(row.sgst || 0).toFixed(2)}</td>
                    <td className="text-center">₹{Number(row.igst || 0).toFixed(2)}</td>
                    <td className="text-center">₹{Number(row.totalGst || 0).toFixed(2)}</td>
                    <td className="text-center">₹{Number(row.grossSales || 0).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">No GST Summary records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default GstSummary;
