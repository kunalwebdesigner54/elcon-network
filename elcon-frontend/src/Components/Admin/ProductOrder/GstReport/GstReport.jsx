import React, { useEffect, useState } from 'react';
import '../../Common/AdminLayout.css';
import '../ProductOrder.css';
import { getAdminGstReport } from '../../../../api/productsService';

const stateCodeMap = {
  AP: "Andhra Pradesh", AR: "Arunachal Pradesh", AS: "Assam", BR: "Bihar", CG: "Chhattisgarh",
  CH: "Chandigarh", DN: "Dadra and Nagar Haveli", DD: "Daman and Diu", DL: "Delhi", GA: "Goa",
  GJ: "Gujarat", HR: "Haryana", HP: "Himachal Pradesh", JK: "Jammu and Kashmir", JH: "Jharkhand",
  KA: "Karnataka", KL: "Kerala", LA: "Ladakh", LD: "Lakshadweep", MP: "Madhya Pradesh",
  MH: "Maharashtra", MN: "Manipur", ML: "Meghalaya", MZ: "Mizoram", NL: "Nagaland", OD: "Odisha",
  OR: "Odisha", PY: "Puducherry", PB: "Punjab", RJ: "Rajasthan", SK: "Sikkim", TN: "Tamil Nadu",
  TG: "Telangana", TS: "Telangana", TR: "Tripura", UP: "Uttar Pradesh", UT: "Uttarakhand",
  UK: "Uttarakhand", WB: "West Bengal"
};

const getFullStateName = (shortCode) => {
  if (!shortCode || shortCode === '---') return '-';
  const code = shortCode.toUpperCase().trim();
  return stateCodeMap[code] || shortCode;
};

function GstReport() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getAdminGstReport();
        if (data && data.success) {
          setReportData(data.report || []);
        }
      } catch (error) {
        console.error('Error fetching GST Report:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  return (
    <div className="admin-product-order-container">
      <h2 className="admin-product-order-title">Member Sales GST Report</h2>
      
      <section className="admin-product-order-panel">
        <div className="btn-row admin-product-order-export-row" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '14px' }}>
          <button type="button" className="btn-outline admin-product-order-export-btn" style={{ minWidth: '72px', padding: '6px 12px', fontSize: '13px', fontWeight: '600', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}>XLS</button>
          <button type="button" className="btn-outline admin-product-order-export-btn" style={{ minWidth: '72px', padding: '6px 12px', fontSize: '13px', fontWeight: '600', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}>PDF</button>
        </div>

        <div className="admin-product-order-table-wrapper">
          <table className="admin-product-order-table">
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Member ID</th>
                <th>Member Name</th>
                <th>Customer Name</th>
                <th>Customer Mobile</th>
                <th>Order ID</th>
                <th>Invoice No</th>
                <th>Invoice Date</th>
                <th>Product Name</th>
                <th>HSN Code</th>
                <th>Quantity</th>
                <th>Unit Price (₹)</th>
                <th>Taxable Value (₹)</th>
                <th>GST Rate</th>
                <th>CGST (₹)</th>
                <th>SGST (₹)</th>
                <th>IGST (₹)</th>
                <th>Total Amount (₹)</th>
                <th>Payment Mode</th>
                <th>Customer State</th>
                <th>Order Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="21" className="text-center">Loading...</td>
                </tr>
              ) : reportData.length > 0 ? (
                reportData.map((row, index) => (
                  <tr key={index}>
                    <td className="text-center">{index + 1}</td>
                    <td>{row.memberId || '-'}</td>
                    <td>{row.memberName || '-'}</td>
                    <td>{row.customerName || '-'}</td>
                    <td>{row.customerMobile || '-'}</td>
                    <td>{row.orderNo || '-'}</td>
                    <td>{row.invoiceNo || '-'}</td>
                    <td>{row.orderDate || '-'}</td>
                    <td>{row.productName || '-'}</td>
                    <td>{row.hsnCode || '-'}</td>
                    <td className="text-center">{row.quantity || 0}</td>
                    <td className="text-center">₹{Number(row.unitPrice || 0).toFixed(2)}</td>
                    <td className="text-center">₹{Number(row.taxableValue || 0).toFixed(2)}</td>
                    <td className="text-center">{row.gstRate || 0}%</td>
                    <td className="text-center">₹{Number(row.cgst || 0).toFixed(2)}</td>
                    <td className="text-center">₹{Number(row.sgst || 0).toFixed(2)}</td>
                    <td className="text-center">₹{Number(row.igst || 0).toFixed(2)}</td>
                    <td className="text-center">₹{Number(row.totalAmount || 0).toFixed(2)}</td>
                    <td>{row.paymentMode || '-'}</td>
                    <td>{getFullStateName(row.customerState)}</td>
                    <td>{row.orderStatus || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="21" className="text-center">No GST records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default GstReport;
