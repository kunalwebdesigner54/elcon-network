import './LevelIncomeReports.css';
import { useEffect, useMemo, useState } from 'react';
import { getLevelIncomeReports } from '../../../../api/membersService';

function LevelIncomeReports() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    memberId: '',
    memberName: '',
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
    
    // Ensure date format is standard YYYY-MM-DD when sent to backend (which input type="date" uses natively)
    const params = {
      page: currentPage,
      limit: filters.limit,
      memberId: filters.memberId,
      memberName: filters.memberName,
      levelNo: filters.levelNo,
      levelId: filters.levelId,
      startDate: filters.startDate,
      endDate: filters.endDate
    };

    getLevelIncomeReports(params)
      .then((response) => {
        setRows(Array.isArray(response.data) ? response.data : []);
        setGlobalTotalAmount(response.globalTotalAmount || 0);
        if (response.pagination) {
          setTotalPages(response.pagination.pages || 1);
        }
      })
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load level income reports.'))
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
      memberId: '',
      memberName: '',
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

  const levelIncomeReportsData = useMemo(() => rows.map((row) => ({
    sNo: row.sNo,
    incomeDateTime: row.incomeDateTime,
    memberId: row.memberId,
    memberName: row.memberName,
    levelNo: row.levelNo,
    levelId: row.levelId,
    fromMemberName: row.fromMemberName,
    amount: Number(row.amount || 0),
    transactionId: row.transactionId,
  })), [rows]);

  const renderPagination = () => {
    const pages = [];
    // Just a simple pagination renderer
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
      pages.push(<button key="1" onClick={() => setCurrentPage(1)} className="level-income-page-btn">1</button>);
      if (startPage > 2) pages.push(<span key="dots1" className="level-income-page-btn">...</span>);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => setCurrentPage(i)} 
          className={`level-income-page-btn ${currentPage === i ? 'level-income-active' : ''}`}
        >
          {i}
        </button>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(<span key="dots2" className="level-income-page-btn">...</span>);
      pages.push(<button key={totalPages} onClick={() => setCurrentPage(totalPages)} className="level-income-page-btn">{totalPages}</button>);
    }
    
    return pages;
  };

  return (
    <div className="level-income-report-page">
      <h2 className="level-income-screen-title">Level Income Reports</h2>

      <section className="panel level-income-panel">
        <div className="level-income-filter-row">
          <input name="memberId" value={filters.memberId} onChange={handleFilterChange} className="text-input level-income-filter-input" placeholder="MEMBER ID" />
          <input name="memberName" value={filters.memberName} onChange={handleFilterChange} className="text-input level-income-filter-input" placeholder="MEMBER NAME" />
          <select name="levelNo" value={filters.levelNo} onChange={handleFilterChange} className="select-input level-income-filter-input">
            <option value="">ALL LEVELS</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => <option key={value} value={value}>Level {value}</option>)}
          </select>
          <input name="levelId" value={filters.levelId} onChange={handleFilterChange} className="text-input level-income-filter-input" placeholder="LEVEL ID" />
          <input name="startDate" value={filters.startDate} onChange={handleFilterChange} className="text-input level-income-filter-input" type="date" placeholder="START DATE" />
          <input name="endDate" value={filters.endDate} onChange={handleFilterChange} className="text-input level-income-filter-input" type="date" placeholder="END DATE" />
          <select name="limit" value={filters.limit} onChange={handleFilterChange} className="select-input level-income-filter-input level-income-size-select">
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button onClick={handleSearch} className="btn-primary level-income-search-btn" type="button">SEARCH</button>
          <button onClick={handleReset} className="btn-outline level-income-search-btn" type="button" style={{ borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}>RESET</button>
        </div>

        <div className="level-income-export-row">
          <button type="button" className="btn-outline level-income-export-btn">XLS</button>
          <button type="button" className="btn-outline level-income-export-btn">PDF</button>
        </div>

        <div className="table-wrap level-income-table-wrap">
          <table className="data-table level-income-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>INCOME DATE & TIME</th>
                <th>MEMBER ID</th>
                <th>MEMBER NAME</th>
                <th>INCOME SLOT</th>
                <th>TRIGGERED BY ID</th>
                <th>FROM MEMBER NAME</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={9} style={{color: 'red'}}>{error}</td></tr>
              ) : levelIncomeReportsData.length === 0 ? (
                <tr><td colSpan={9}>No level income reports found.</td></tr>
              ) : (
                <>
                  {levelIncomeReportsData.map((row) => (
                    <tr key={row.transactionId || row.sNo}>
                      <td>{row.sNo}</td>
                      <td>{row.incomeDateTime}</td>
                      <td>{row.memberId}</td>
                      <td>{row.memberName}</td>
                      <td>{row.levelNo}</td>
                      <td>{row.levelId}</td>
                      <td>{row.fromMemberName}</td>
                      <td>{Number(row.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="level-income-summary-row">
                    <td colSpan="7" style={{ textAlign: 'right', fontWeight: 700 }}>
                      TOTAL AMOUNT (All Pages)
                    </td>
                    <td>{globalTotalAmount.toFixed(2)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="level-income-table-footer">
          <div className="level-income-pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="level-income-page-btn">«</button>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="level-income-page-btn">‹</button>
            {renderPagination()}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="level-income-page-btn">›</button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} className="level-income-page-btn">»</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LevelIncomeReports;
