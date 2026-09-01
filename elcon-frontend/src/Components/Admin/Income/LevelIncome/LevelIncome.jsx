import './LevelIncome.css';
import { useEffect, useState } from 'react';
import { getLevelIncomeReports } from '../../../../api/levelIncomeService';

function LevelIncome() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    memberId: '',
    memberName: '',
    levelNo: '',
    levelId: '',
    startDate: '',
    endDate: ''
  });

  const fetchReports = () => {
    setLoading(true);
    setError('');
    getLevelIncomeReports({ page, limit, ...filters })
      .then((response) => {
        let rowsData = [];
        if (Array.isArray(response)) rowsData = response;
        else if (response && Array.isArray(response.data)) rowsData = response.data;
        else if (response && response.data && Array.isArray(response.data.data)) rowsData = response.data.data;
        else if (response && Array.isArray(response.records)) rowsData = response.records;
        
        setRows(rowsData);
        
        const totalAmt = response?.globalTotalAmount ?? response?.data?.globalTotalAmount ?? 0;
        setTotalAmount(totalAmt);
        
        const paginationData = response?.pagination || response?.data?.pagination;
        if (paginationData) {
          setTotalPages(paginationData.pages || 1);
        }
      })
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load level income report.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, [page, limit]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    setPage(1);
    fetchReports();
  };

  return (
    <div className="tds-report-page">
      <h2 className="section-title tds-screen-title">Level Income Reports</h2>

      <section className="panel tds-panel">
        <div className="tds-filter-row">
          <input className="text-input tds-filter-input" name="memberId" value={filters.memberId} onChange={handleFilterChange} placeholder="MEMBER ID" />
          <input className="text-input tds-filter-input" name="memberName" value={filters.memberName} onChange={handleFilterChange} placeholder="MEMBER NAME" />
          <input className="text-input tds-filter-input" name="levelNo" value={filters.levelNo} onChange={handleFilterChange} placeholder="LEVEL NO" />
          <input className="text-input tds-filter-input" name="levelId" value={filters.levelId} onChange={handleFilterChange} placeholder="LEVEL ID" />
          <input className="text-input tds-filter-input" name="startDate" type="date" value={filters.startDate} onChange={handleFilterChange} placeholder="START DATE" />
          <input className="text-input tds-filter-input" name="endDate" type="date" value={filters.endDate} onChange={handleFilterChange} placeholder="END DATE" />
          <select className="select-input tds-filter-input tds-size-select" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="btn-primary tds-search-btn" type="button" onClick={handleSearch}>Search</button>
        </div>

        <div className="btn-row tds-export-row">
          <button type="button" className="btn-outline tds-export-btn">XLS</button>
          <button type="button" className="btn-outline tds-export-btn">PDF</button>
        </div>

        <div className="table-wrap tds-table-wrap">
          <table className="data-table tds-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>INCOME DATE</th>
                <th>MEMBER ID</th>
                <th>MEMBER NAME</th>
                <th>INCOME LEVEL</th>
                <th>LEVEL ID (SOURCE)</th>
                <th>FROM MEMBER NAME</th>
                <th>PHYSICAL DEPTH</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={9} style={{ color: 'red' }}>{error}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={9}>No level income records found.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.transactionId || row.sNo}>
                  <td>{row.sNo}</td>
                  <td>{row.incomeDateTime}</td>
                  <td>{row.memberId}</td>
                  <td>{row.memberName}</td>
                  <td>{String(row.levelNo || '').replace(/Level/gi, 'Upline')}</td>
                  <td>{row.levelId}</td>
                  <td>{row.fromMemberName}</td>
                  <td>{row.physicalDepth}</td>
                  <td>{Number(row.amount || 0).toFixed(2)}</td>
                </tr>
              ))}
              {rows.length > 0 && (
                <tr className="level-income-summary-row">
                  <td colSpan="8" style={{ textAlign: 'right', fontWeight: 700 }}>
                    PAGE TOTAL
                  </td>
                  <td>{totalAmount.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer" style={{ justifyContent: 'center', marginTop: '12px' }}>
          <div className="pagination">
            <button className="page-btn">&laquo;</button>
            <button className="page-btn">&lsaquo;</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">4</button>
            <button className="page-btn">5</button>
            <button className="page-btn">6</button>
            <button className="page-btn">7</button>
            <button className="page-btn">&rsaquo;</button>
            <button className="page-btn">&raquo;</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LevelIncome;
