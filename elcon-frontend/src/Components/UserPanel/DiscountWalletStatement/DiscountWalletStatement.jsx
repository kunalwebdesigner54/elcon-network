import React, { useState, useEffect } from 'react';
import './DiscountWalletStatement.css';
import { getUserDiscountWalletStatement } from '../../../api/managementService';

function DiscountWalletStatement() {
  const [filters, setFilters] = useState({
    transactionType: '',
    memberId: '',
    reference: '',
    fromDate: '',
    toDate: '',
    pageSize: '10'
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  
  const [stats, setStats] = useState({
    walletBalance: 0,
    totalIssued: 0,
    totalUsed: 0
  });

  const fetchData = async (currentPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserDiscountWalletStatement({
        page: currentPage,
        limit: filters.pageSize,
        transactionType: filters.transactionType,
        memberId: filters.memberId,
        reference: filters.reference,
        fromDate: filters.fromDate,
        toDate: filters.toDate
      });

      if (response.success) {
        setData(response.transactions || []);
        setTotalPages(response.totalPages || 1);
        setTotalEntries(response.total || 0);
        setStats({
          walletBalance: response.walletBalance || 0,
          totalIssued: response.totalIssued || 0,
          totalUsed: response.totalUsed || 0
        });
      } else {
        setError(response.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page, filters.pageSize]);

  const handleSearch = () => {
    setPage(1);
    fetchData(1);
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
    fetchData(1);
  };

  const updateFilter = (key) => (event) => setFilters((previous) => ({ ...previous, [key]: event.target.value }));

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="discount-wallet-statement-page">
      <section className="discount-wallet-statement-panel">
        <h2 className="discount-wallet-statement-heading">Discount Wallet Statement</h2>

        <div className="stats-row">
          <div className="stat-card card-green">
            <div className="stat-title">E-wallet<br />Balance</div>
            <div className="stat-value">{stats.walletBalance}</div>
          </div>
          <div className="stat-card card-blue">
            <div className="stat-title">Total Discount<br />Issued</div>
            <div className="stat-value">{stats.totalIssued}</div>
          </div>
          <div className="stat-card card-orange">
            <div className="stat-title">Total used<br />Discount</div>
            <div className="stat-value">{stats.totalUsed}</div>
          </div>
          <div className="stat-card card-purple">
            <div className="stat-title">Total un-used<br />Discount</div>
            <div className="stat-value">{stats.totalIssued - stats.totalUsed}</div>
          </div>
        </div>

        <div className="discount-wallet-statement-toolbar">
          <div className="discount-wallet-statement-filter-row">
            <select 
              className="discount-wallet-statement-filter-input" 
              value={filters.transactionType} 
              onChange={updateFilter('transactionType')}
            >
              <option value="">TRANSACTION TYPE</option>
              <option value="ADMIN CREDIT">ADMIN CREDIT</option>
              <option value="ADMIN DEBIT">ADMIN DEBIT</option>
              <option value="REWARD CREDIT">REWARD CREDIT</option>
              <option value="DISCOUNT USED">DISCOUNT USED</option>
            </select>
            <input 
              className="discount-wallet-statement-filter-input" 
              placeholder="MEMBER ID" 
              value={filters.memberId} 
              onChange={updateFilter('memberId')} 
            />
            <input 
              className="discount-wallet-statement-filter-input" 
              placeholder="REFERENCE" 
              value={filters.reference} 
              onChange={updateFilter('reference')} 
            />
            <input 
              type="text"
              className="discount-wallet-statement-filter-input" 
              placeholder="DD-MM-YYYY" 
              value={filters.fromDate} 
              onChange={updateFilter('fromDate')} 
            />
            <input 
              type="text"
              className="discount-wallet-statement-filter-input" 
              placeholder="DD-MM-YYYY" 
              value={filters.toDate} 
              onChange={updateFilter('toDate')} 
            />
            <select 
              className="discount-wallet-statement-filter-input select-page-size" 
              value={filters.pageSize} 
              onChange={updateFilter('pageSize')}
            >
              <option value="10">10/50/100</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            
            <div className="filter-buttons">
              <button type="button" className="btn-primary search-btn" onClick={handleSearch}>SERCH</button>
              <button type="button" className="btn-outline reset-btn" onClick={handleReset}>RESET</button>
              <button type="button" className="btn-outline excel-btn">Excel</button>
              <button type="button" className="btn-outline pdf-btn">PDF</button>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          {error && <div className="error-message">{error}</div>}
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>TXN ID</th>
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
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No records found.</td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row._id || row.sno}>
                    <td>{row.sno}</td>
                    <td>{row.transactionId}</td>
                    <td>{row.transactionType}</td>
                    <td className="text-success">{row.credit || 0}</td>
                    <td className="text-danger">{row.debit || 0}</td>
                    <td>{row.balance || 0}</td>
                    <td>{row.transactionDate}</td>
                    <td>{row.reference || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="total-entries">
            Total Entries : {totalEntries}
          </div>
          <div className="pagination">
            <button 
              type="button" 
              className="page-btn" 
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              «
            </button>
            {generatePageNumbers().map((num) => (
              <button 
                key={num} 
                type="button" 
                className={`page-btn ${page === num ? 'active-page' : ''}`}
                onClick={() => setPage(num)}
              >
                {num}
              </button>
            ))}
            <button 
              type="button" 
              className="page-btn" 
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
            >
              »
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DiscountWalletStatement;
