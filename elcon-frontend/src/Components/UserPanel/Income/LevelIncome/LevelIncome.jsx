import '../../Common/UserLayout.css';
import './LevelIncome.css';
import { useEffect, useState } from 'react';
import { getLevelIncomeReports } from '../../../../api/levelIncomeService';

function LevelIncome() {
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

    getLevelIncomeReports(params)
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
        }
      })
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load level income.'))
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
      pages.push(<button key="1" type="button" onClick={() => setCurrentPage(1)} className="level-income-page-btn">1</button>);
      if (startPage > 2) pages.push(<span key="dots1" className="level-income-page-btn">...</span>);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          type="button"
          onClick={() => setCurrentPage(i)} 
          className={`level-income-page-btn ${currentPage === i ? 'level-income-page-btn-active' : ''}`}
        >
          {i}
        </button>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(<span key="dots2" className="level-income-page-btn">...</span>);
      pages.push(<button key={totalPages} type="button" onClick={() => setCurrentPage(totalPages)} className="level-income-page-btn">{totalPages}</button>);
    }
    
    return pages;
  };

  return (
    <div>
      <h1 className="user-page-title">Level Income</h1>
      <div className="user-panel">
        <h3>Total Level Income : {globalTotalAmount.toFixed(2)}</h3>

        <div className="level-income-filters">
          <select aria-label="Level Number" name="levelNo" value={filters.levelNo} onChange={handleFilterChange} className="level-income-input">
            <option value="">ALL LEVELS</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => <option key={value} value={value}>Level {value}</option>)}
          </select>
          <input type="text" placeholder="LEVEL ID" aria-label="Level ID" name="levelId" value={filters.levelId} onChange={handleFilterChange} className="level-income-input" />
          <input type="date" placeholder="START DATE" aria-label="Start Date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="level-income-input" />
          <input type="date" placeholder="END DATE" aria-label="End Date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="level-income-input" />
          <select aria-label="Rows per page" name="limit" value={filters.limit} onChange={handleFilterChange} className="level-income-input">
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button onClick={handleSearch} className="user-btn-blue level-income-search-btn" type="button">SEARCH</button>
          <button onClick={handleReset} className="user-btn-outline level-income-search-btn" type="button" style={{ borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}>RESET</button>
        </div>

        <div className="table-toolbar">
          <button className="user-btn-outline" type="button">Excel</button>
          <button className="user-btn-outline" type="button">PDF</button>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>INCOME DATE & TIME</th>
                <th>MEMBER ID</th>
                <th>MEMBER NAME</th>
                <th>INCOME SLOT</th>
                <th>LEVEL ID (SOURCE)</th>
                <th>FROM MEMBER NAME</th>
                <th>SKIPPED IDs</th>
                <th>LEVEL DEPTH</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={10} style={{color: 'red'}}>{error}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={10}>No level income records found.</td></tr>
              ) : (
                <>
                  {rows.map((row, index) => (
                    <tr key={row.transactionId || row.sNo || index}>
                      <td>{row.sNo}</td>
                      <td>{row.incomeDateTime}</td>
                      <td>{row.memberId}</td>
                      <td>{row.memberName}</td>
                      <td>{row.levelNo}</td>
                      <td>{row.levelId}</td>
                      <td>{row.fromMemberName}</td>
                      <td style={{ maxWidth: '150px', wordWrap: 'break-word' }}>{row.skippedIds || '---'}</td>
                      <td>{row.physicalDepth}</td>
                      <td>{Number(row.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="level-income-total-row">
                    <td colSpan={9} style={{ textAlign: 'right' }}>TOTAL (All Pages)</td>
                    <td>{globalTotalAmount.toFixed(2)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="level-income-pagination" aria-label="Pagination">
          <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="level-income-page-btn">«</button>
          <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="level-income-page-btn">‹</button>
          {renderPagination()}
          <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="level-income-page-btn">›</button>
          <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} className="level-income-page-btn">»</button>
        </div>
      </div>
    </div>
  );
}

export default LevelIncome;
