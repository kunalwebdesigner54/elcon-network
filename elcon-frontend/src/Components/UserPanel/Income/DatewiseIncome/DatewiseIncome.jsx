import '../../Common/UserLayout.css';
import './DatewiseIncome.css';
import { useEffect, useMemo, useState } from 'react';
import { getMyDatewiseIncome } from '../../../../api/membersService';
import { getUser } from '../../../../utils/auth';

function DatewiseIncome() {
  const currentUser = getUser() || {};
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageSize, setPageSize] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getMyDatewiseIncome()
      .then((response) => setRows(Array.isArray(response.data) ? response.data : []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load datewise income.'))
      .finally(() => setLoading(false));
  }, []);

  const datewiseIncomeData = useMemo(() => {
    const grouped = new Map();

    rows.forEach((row) => {
      const key = row.dateRaw ? new Date(row.dateRaw).toISOString().slice(0, 10) : row.date;
      const current = grouped.get(key) || { count: 0, amount: 0, latest: row };
      current.count += 1;
      current.amount += Number(row.amount || 0);
      current.latest = row;
      grouped.set(key, current);
    });

    return Array.from(grouped.entries())
      .sort((left, right) => new Date(right[0]).getTime() - new Date(left[0]).getTime())
      .map(([date, group], index) => ({
        sNo: index + 1,
        incomeDate: date,
        memberId: group.latest.toMemberId || currentUser.memberId,
        memberName: group.latest.toName || currentUser.name || '---',
        totalIds: group.count,
        levelIncome: group.amount * 0.5,
        totalBvPoint: group.amount * 0.5,
        repurchaseIncome: group.amount * 0.5,
        dailyIncome: group.amount,
      }));
  }, [rows]);

  const indexOfLastItem = currentPage * Number(pageSize);
  const indexOfFirstItem = indexOfLastItem - Number(pageSize);
  const visibleRows = datewiseIncomeData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(datewiseIncomeData.length / Number(pageSize)));

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalAmount = visibleRows.reduce((sum, row) => sum + row.dailyIncome, 0);

  return (
    <div>
      <h1 className="user-page-title">Datewise Income</h1>
      <div className="user-panel">
        <div className="report-filters">
          <input type="date" placeholder="START DATE" aria-label="Start Date" />
          <input type="date" placeholder="END DATE" aria-label="End Date" />
          <select aria-label="Rows per page" value={pageSize} onChange={(event) => { setPageSize(event.target.value); setCurrentPage(1); }}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="user-btn-blue" type="button" onClick={() => setCurrentPage(1)}>SEARCH</button>
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
                <th>INCOME DATE</th>
                <th>MEMBER ID</th>
                <th>MEMBER NAME</th>
                <th>TOTAL ID'S</th>
                <th>LEVEL INCOME</th>
                <th>TOTAL BV POINT</th>
                <th>REPURCHASE INCOME</th>
                <th>DAILY INCOME</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={8}>{error}</td></tr>
              ) : datewiseIncomeData.length === 0 ? (
                <tr><td colSpan={9}>No datewise income records found.</td></tr>
              ) : visibleRows.map((row) => (
                <tr key={row.sNo}>
                  <td>{row.sNo}</td>
                  <td>{row.incomeDate}</td>
                  <td>{row.memberId}</td>
                  <td>{row.memberName}</td>
                  <td>{row.totalIds}</td>
                  <td>{row.levelIncome.toFixed(2)}</td>
                  <td>{row.totalBvPoint.toFixed(2)}</td>
                  <td>{row.repurchaseIncome.toFixed(2)}</td>
                  <td>{row.dailyIncome.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="report-total-row">
                <td style={{
                    textAlign: "end",
                  }} colSpan="8">PAGE TOTAL AMOUNT</td>
                <td>{totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="table-footer" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', gap: '15px', background: 'rgba(0, 229, 255, 0.05)', padding: '16px', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: '12px' }}>
          <div style={{ fontWeight: '700', color: '#00e5ff', fontSize: '16px', letterSpacing: '0.5px' }}>
            <i className="fa-solid fa-chart-pie" style={{ marginRight: '8px' }}></i>
            Total Entries : {datewiseIncomeData.length}
          </div>
          <div className="pagination" style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            <button className="page-btn" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>«</button>
            <button className="page-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>‹</button>
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              if (
                totalPages <= 7 ||
                pageNum === 1 ||
                pageNum === totalPages ||
                Math.abs(currentPage - pageNum) <= 1
              ) {
                return (
                  <button 
                    key={pageNum} 
                    className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                (pageNum === 2 && currentPage > 3) ||
                (pageNum === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return <span key={pageNum} style={{color: '#00e5ff', padding: '0 5px'}}>...</span>;
              }
              return null;
            })}
            <button className="page-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
            <button className="page-btn" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>»</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatewiseIncome;
