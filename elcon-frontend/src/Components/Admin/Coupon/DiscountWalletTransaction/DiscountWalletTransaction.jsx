import React, { useState, useEffect } from 'react';
import './DiscountWalletTransaction.css';
import { getAdminDiscountWalletTransactions, getAdminDiscountWalletOverview } from '../../../../api/managementService';

function DiscountWalletTransaction() {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);

  const [stats, setStats] = useState({
    totalMembers: 0,
    totalDiscountIssued: 0,
    totalUsedDiscount: 0,
    totalUnusedDiscount: 0
  });

  const [filters, setFilters] = useState({
    transactionType: '',
    memberId: '',
    reference: '',
    fromDate: '',
    toDate: '',
    pageSize: '10'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: filters.pageSize,
        transactionType: filters.transactionType,
        memberId: filters.memberId,
        reference: filters.reference,
        fromDate: filters.fromDate,
        toDate: filters.toDate
      };
      
      const [txRes, overviewRes] = await Promise.all([
        getAdminDiscountWalletTransactions(params),
        getAdminDiscountWalletOverview({ page: 1, limit: 1 })
      ]);

      if (txRes.success) {
        setData(txRes.data || []);
        setTotalPages(txRes.totalPages || 1);
        setTotalEntries(txRes.total || 0);
      } else {
        setData([]);
      }

      if (overviewRes.success && overviewRes.stats) {
        setStats(overviewRes.stats);
      }
    } catch (error) {
      console.error("Failed to fetch transaction data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.pageSize]);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleReset = () => {
    setFilters({
      transactionType: '',
      memberId: '',
      reference: '',
      fromDate: '',
      toDate: '',
      pageSize: '10'
    });
    setPage(1);
    setTimeout(fetchData, 0);
  };

  const updateFilter = (key) => (event) => setFilters((previous) => ({ ...previous, [key]: event.target.value }));

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="discount-wallet-page">
      <section className="discount-wallet-panel">
        <h2 className="discount-wallet-heading">DISCOUNT WALLET TRANSACTION</h2>

        <div className="stats-row">
          <div className="stat-card card-green">
            <div className="stat-title">Total<br />Members</div>
            <div className="stat-value">{stats.totalMembers}</div>
          </div>
          <div className="stat-card card-blue">
            <div className="stat-title">Total Discount<br />Issued</div>
            <div className="stat-value">{stats.totalDiscountIssued}</div>
          </div>
          <div className="stat-card card-pink">
            <div className="stat-title">Total used<br />Discount</div>
            <div className="stat-value">{stats.totalUsedDiscount}</div>
          </div>
          <div className="stat-card card-orange">
            <div className="stat-title">Total un-used<br />Discount</div>
            <div className="stat-value">{stats.totalUnusedDiscount}</div>
          </div>
        </div>

        <div className="discount-wallet-toolbar">
          <div className="discount-wallet-filter-row">
            <input 
              className="discount-wallet-filter-input" 
              placeholder="TRANSACTION TYPE" 
              value={filters.transactionType} 
              onChange={updateFilter('transactionType')} 
            />
            <input 
              className="discount-wallet-filter-input" 
              placeholder="MEMBER ID" 
              value={filters.memberId} 
              onChange={updateFilter('memberId')} 
            />
            <input 
              className="discount-wallet-filter-input" 
              placeholder="REFERENCE" 
              value={filters.reference} 
              onChange={updateFilter('reference')} 
            />
            <input 
              type="date"
              className="discount-wallet-filter-input" 
              placeholder="DD-MM-YYYY" 
              value={filters.fromDate} 
              onChange={updateFilter('fromDate')} 
            />
            <input 
              type="date"
              className="discount-wallet-filter-input" 
              placeholder="DD-MM-YYYY" 
              value={filters.toDate} 
              onChange={updateFilter('toDate')} 
            />
            <select 
              className="discount-wallet-filter-input select-page-size" 
              value={filters.pageSize} 
              onChange={updateFilter('pageSize')}
            >
              <option value="10">10/50/100</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            
            <div className="filter-buttons">
              <button type="button" className="btn-primary search-btn" onClick={handleSearch} disabled={loading}>SEARCH</button>
              <button type="button" className="btn-outline reset-btn" onClick={handleReset} disabled={loading}>RESET</button>
              <button type="button" className="btn-outline excel-btn">Excel</button>
              <button type="button" className="btn-outline pdf-btn">PDF</button>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Txn ID</th>
                <th>MEMBER ID</th>
                <th>MEMBER NAME</th>
                <th>TRANSACTION TYPE</th>
                <th>CREDIT</th>
                <th>DEBIT</th>
                <th>BALANCE</th>
                <th>TRANSACTION DATE</th>
                <th>REFERENCE</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row, index) => (
                  <tr key={row._id || index}>
                    <td>{(page - 1) * parseInt(filters.pageSize, 10) + index + 1}</td>
                    <td>{row.transactionId || '-'}</td>
                    <td>{row.memberId}</td>
                    <td>{row.memberName}</td>
                    <td>{row.transactionType}</td>
                    <td>{row.credit}</td>
                    <td>{row.debit}</td>
                    <td>{row.balance}</td>
                    <td>{new Date(row.createdAt).toLocaleString('en-GB')}</td>
                    <td>{row.reference || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>No Data Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="total-entries">
            Total Entries : {totalEntries}
          </div>
          <div className="pagination">
                <button className="page-btn" onClick={() => handlePageChange(1)} disabled={page === 1}>&lt;&lt;</button>
                <button className="page-btn" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Prev</button>
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  let s = Math.max(1, page - 1);
                  let e = Math.min(totalPages, s + 2);
                  if (e - s < 2) s = Math.max(1, e - 2);
                  if (p < s || p > e) return null;
                  return (
                    <button 
                      key={p} 
                      className={`page-btn ${page === p ? 'active' : ''}`}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  );
                })}
                <button className="page-btn" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>Next</button>
                <button className="page-btn" onClick={() => handlePageChange(totalPages)} disabled={page === totalPages}>&gt;&gt;</button>
              </div>
        </div>
      </section>
    </div>
  );
}

export default DiscountWalletTransaction;
