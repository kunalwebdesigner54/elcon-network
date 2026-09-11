import React, { useEffect, useState } from 'react';
import './RepurchaseIncome.css';
import { getRepurchaseIncomeReports } from '../../../../api/membersService';

function RepurchaseIncome() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    levelNo: '',
    levelId: '',
    startDate: '',
    endDate: '',
    limit: '10'
  });
  const [globalTotalAmount, setGlobalTotalAmount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  const fetchReports = () => {
    setLoading(true);
    setError('');
    
    const params = {
      page: currentPage,
      limit: filters.limit,
      levelNo: filters.levelNo,
      levelId: filters.levelId,
      startDate: filters.startDate,
      endDate: filters.endDate
    };

    getRepurchaseIncomeReports(params)
      .then((response) => {
        let rowsData = [];
        if (Array.isArray(response)) rowsData = response;
        else if (response && Array.isArray(response.data)) rowsData = response.data;
        else if (response && response.data && Array.isArray(response.data.data)) rowsData = response.data.data;
        else if (response && Array.isArray(response.records)) rowsData = response.records;
        
        setRows(rowsData);
        
        const totalAmt = response?.globalTotalAmount ?? response?.data?.globalTotalAmount ?? 0;
        setGlobalTotalAmount(totalAmt);
        
        const paginationData = response?.pagination || response?.data?.pagination;
        if (paginationData) {
          setTotalPages(paginationData.pages || 1);
          setTotalEntries(paginationData.total || rowsData.length);
        } else {
          setTotalEntries(rowsData.length);
        }
      })
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load repurchase income.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    if (currentPage === 1) {
      fetchReports();
    } else {
      setCurrentPage(1);
    }
  };

  const handleReset = () => {
    setFilters({
      levelNo: '',
      levelId: '',
      startDate: '',
      endDate: '',
      limit: '10'
    });
    if (currentPage === 1) {
      setTimeout(fetchReports, 0);
    } else {
      setCurrentPage(1);
    }
  };

  const renderPagination = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
      pages.push(<button key="1" type="button" onClick={() => setCurrentPage(1)} className="page-btn">1</button>);
      if (startPage > 2) pages.push(<span key="dots1" className="page-btn">...</span>);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          type="button"
          onClick={() => setCurrentPage(i)} 
          className={`page-btn ${currentPage === i ? 'active-page' : ''}`}
        >
          {i}
        </button>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(<span key="dots2" className="page-btn">...</span>);
      pages.push(<button key={totalPages} type="button" onClick={() => setCurrentPage(totalPages)} className="page-btn">{totalPages}</button>);
    }
    
    return pages;
  };

  return (
    <div className="repurchase-income-page">
      <section className="repurchase-income-panel">
        <h2 className="repurchase-income-heading">Repurchase Income</h2>
        <div className="member-panel-badge">Member Panel</div>

        <div className="repurchase-income-toolbar">
          <div className="repurchase-income-filter-row">
            <select 
              className="repurchase-income-filter-input" 
              name="levelNo" 
              value={filters.levelNo} 
              onChange={handleFilterChange}
            >
              <option value="">LEVEL DEPTH</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                <option key={val} value={val}>Level {val}</option>
              ))}
            </select>
            <input 
              className="repurchase-income-filter-input" 
              placeholder="LEVEL ID" 
              name="levelId" 
              value={filters.levelId} 
              onChange={handleFilterChange} 
            />
            <input 
              type="text"
              className="repurchase-income-filter-input" 
              placeholder="DD-MM-YYYY" 
              name="startDate" 
              value={filters.startDate} 
              onChange={handleFilterChange} 
            />
            <input 
              type="text"
              className="repurchase-income-filter-input" 
              placeholder="DD-MM-YYYY" 
              name="endDate" 
              value={filters.endDate} 
              onChange={handleFilterChange} 
            />
            <select 
              className="repurchase-income-filter-input select-page-size" 
              name="limit" 
              value={filters.limit} 
              onChange={handleFilterChange}
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
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>INCOME DATE & TIME</th>
                <th>MEMBER ID</th>
                <th>MEMBER NAME</th>
                <th>DIRECTS</th>
                <th>LEVEL DEPTH</th>
                <th>LEVEL ID</th>
                <th>FROM MEMBER NAME</th>
                <th>BV POINT</th>
                <th>SKIPPED ID</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} style={{textAlign: 'center'}}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={11} style={{textAlign: 'center', color: 'red'}}>{error}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={11} style={{textAlign: 'center'}}>No records found.</td></tr>
              ) : (
                <>
                  {rows.map((row, index) => (
                    <tr key={row.transactionId || row.sNo || index}>
                      <td>{row.sNo || index + 1}</td>
                      <td>{row.incomeDateTime}</td>
                      <td>{row.memberId}</td>
                      <td>{row.memberName}</td>
                      <td>{row.directs || '10'}</td>
                      <td>{row.physicalDepth || row.levelNo || '-'}</td>
                      <td>{row.levelId}</td>
                      <td>{row.fromMemberName}</td>
                      <td>{Number(row.bvPoint || 20).toFixed(2)}</td>
                      <td>{row.skippedIds || '-'}</td>
                      <td>{Number(row.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td colSpan={9}></td>
                    <td style={{ textAlign: 'right' }}>Total Amount</td>
                    <td>{globalTotalAmount.toFixed(2)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="total-entries">
            Total Entries : {totalEntries}
          </div>
          <div className="pagination">
            <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="page-btn">«</button>
            <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="page-btn">‹</button>
            {renderPagination()}
            <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="page-btn">›</button>
            <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} className="page-btn">»</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default RepurchaseIncome;
