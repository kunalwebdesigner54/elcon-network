import React, { useState, useEffect } from 'react';
import { franchiseGetMyStock } from '../../../api/managementService';
import Swal from 'sweetalert2';
import '../../Common/UserLayout.css';

function FranchiseProductStock() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const res = await franchiseGetMyStock();
      if (res?.success) {
        setStocks(res.stocks || []);
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load stock' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="user-page-title">My Product Stock</h1>
      <div className="user-panel">
        {loading ? (
          <p style={{ padding: '16px' }}>Loading...</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Code</th>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Available</th>
                </tr>
              </thead>
              <tbody>
                {stocks && stocks.length > 0 ? (
                  stocks.map(stock => (
                    <tr key={stock?._id || Math.random()}>
                      <td>{stock?.productCode}</td>
                      <td>
                        {stock?.image ? (
                          <img src={stock.image} alt={stock?.productName} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          'No Image'
                        )}
                      </td>
                      <td>{stock?.productName}</td>
                      <td>{stock?.type}</td>
                      <td>₹{stock?.dpPrice || stock?.price}</td>
                      <td style={{ fontWeight: 'bold', color: (stock?.quantity || 0) > 0 ? 'green' : 'red' }}>
                        {stock?.quantity || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>You have no product stock currently.</td>
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

export default FranchiseProductStock;
