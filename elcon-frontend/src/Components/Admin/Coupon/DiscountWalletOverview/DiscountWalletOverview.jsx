import React, { useState, useEffect } from 'react';
import './DiscountWalletOverview.css';
import { getAdminDiscountWalletOverview } from '../../../../api/managementService';

function DiscountWalletOverview() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalDiscountIssued: 0,
    totalUsedDiscount: 0,
    totalUnusedDiscount: 0
  });
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);

  const [filters, setFilters] = useState({
    memberId: '',
    donationStatus: '',
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
        memberId: filters.memberId,
        donationStatus: filters.donationStatus,
        fromDate: filters.fromDate,
        toDate: filters.toDate
      };
      const res = await getAdminDiscountWalletOverview(params);
      if (res.success) {
        setData(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotalEntries(res.total || 0);
        if (res.stats) {
          setStats(res.stats);
        }
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Failed to fetch overview data", error);
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
      memberId: '',
      donationStatus: '',
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
    <div className="discount-wallet-overview-page">
      <section className="discount-wallet-overview-panel">
        <h2 className="discount-wallet-overview-heading">Discount Wallet Overview</h2>

        <div className="stats-row">
          <div className="stat-card card-green">
            <div className="stat-title">Total<br />Members</div>
            <div className="stat-value">{stats.totalMembers}</div>
          </div>
          <div className="stat-card card-blue">
            <div className="stat-title">Total Discount<br />Issued</div>
            <div className="stat-value">{stats.totalDiscountIssued}</div>
          </div>
          <div className="stat-card card-orange">
            <div className="stat-title">Total used<br />Discount</div>
            <div className="stat-value">{stats.totalUsedDiscount}</div>
          </div>
          <div className="stat-card card-purple">
            <div className="stat-title">Total un-used<br />Discount</div>
            <div className="stat-value">{stats.totalUnusedDiscount}</div>
          </div>
        </div>

        <div className="discount-wallet-overview-toolbar">
          <div className="discount-wallet-overview-filter-row">
            <input 
              className="discount-wallet-overview-filter-input" 
              placeholder="MEMBER ID" 
              value={filters.memberId} 
              onChange={updateFilter('memberId')} 
            />
            <select 
              className="discount-wallet-overview-filter-input" 
              value={filters.donationStatus} 
              onChange={updateFilter('donationStatus')}
            >
              <option value="">DONATION STATUS</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="IN-ACTIVE">IN-ACTIVE</option>
            </select>
            <input 
              type="date"
              className="discount-wallet-overview-filter-input" 
              placeholder="DD-MM-YYYY" 
              value={filters.fromDate} 
              onChange={updateFilter('fromDate')} 
            />
            <input 
              type="date"
              className="discount-wallet-overview-filter-input" 
              placeholder="DD-MM-YYYY" 
              value={filters.toDate} 
              onChange={updateFilter('toDate')} 
            />
            <select 
              className="discount-wallet-overview-filter-input select-page-size" 
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
                <th>MEMBER ID</th>
                <th>MEMBER NAME</th>
                <th>DONATION STATUS</th>
                <th>CREDIT GIVEN</th>
                <th>USED AMOUNT</th>
                <th>AVAILABLE BALANCE</th>
                <th>LAST TRANSACTION DATE</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row, index) => (
                  <tr key={index}>
                    <td>{(page - 1) * parseInt(filters.pageSize, 10) + index + 1}</td>
                    <td>{row.memberId}</td>
                    <td>{row.memberName}</td>
                    <td className={row.donationStatus === 'ACTIVE' ? 'status-completed' : 'status-pending'}>
                      {row.donationStatus}
                    </td>
                    <td>{row.creditGiven}</td>
                    <td>{row.usedAmount}</td>
                    <td>{row.availableBalance}</td>
                    <td>{row.transactionDate ? new Date(row.transactionDate).toLocaleString('en-GB') : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No Data Found</td>
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

export default DiscountWalletOverview;
