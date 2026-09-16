import { useEffect, useMemo, useState } from 'react';
import '../../Common/UserLayout.css';
import './TransactionHistory.css';
import { getUserTransactionHistory } from '../../../../api/managementService';

function formatAmount(value) {
  const totalPages = 1;

  return Number(value || 0).toFixed(2);
}

function TransactionHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actualBalance, setActualBalance] = useState(0);

  const [filters, setFilters] = useState({ transactionId: '', startDate: '', endDate: '' });
  const [appliedFilters, setAppliedFilters] = useState({ transactionId: '', startDate: '', endDate: '' });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await getUserTransactionHistory({
        page,
        limit: pageSize,
        startDate: appliedFilters.startDate || undefined,
        endDate: appliedFilters.endDate || undefined,
      });
      setRows(response.transactions || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
      if (response.walletBalance !== undefined) {
        setActualBalance(response.walletBalance);
      }
    } catch (error) {
      setRows([]);
      setTotal(0);
      setTotalPages(1);
      setActualBalance(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, pageSize, appliedFilters]);

  const handleSearch = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const totalCredit = useMemo(() => rows.reduce((sum, row) => sum + Number(row.credit || 0), 0), [rows]);
  const totalDebit = useMemo(() => rows.reduce((sum, row) => sum + Number(row.debit || 0), 0), [rows]);
  const totalTransactions = total;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div>
      <h1 className="user-page-title">Transaction History</h1>
      <div className="user-panel">
        <div className="transaction-header">
          <div className="transaction-summary-group">
            <h3>Total Balance: {actualBalance ? Number(actualBalance).toFixed(2) : '0.00'}</h3>
          </div>
        </div>

        <div className="report-filters">
          <input type="text" name="transactionId" placeholder="TRANSACTION ID" aria-label="Transaction ID" value={filters.transactionId} onChange={handleFilterChange} />
          <input type="date" name="startDate" placeholder="START DATE" aria-label="Start Date" value={filters.startDate} onChange={handleFilterChange} />
          <input type="date" name="endDate" placeholder="END DATE" aria-label="End Date" value={filters.endDate} onChange={handleFilterChange} />
          <select aria-label="Rows per page" value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="user-btn-blue" type="button" onClick={handleSearch}>SEARCH</button>
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
                <th>TRANSACTION DATE & TIME</th>
                <th>TRANSACTION ID</th>
                <th>DISCRIPTIONS</th>
                <th>CREDIT</th>
                <th>DEBIT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9">Loading...</td></tr>
              ) : rows.length ? rows.map((row) => (
                <tr key={row.sNo}>
                  <td>{row.sNo}</td>
                  <td>{row.dateTime}</td>
                  <td>{row.transactionId}</td>
                  <td>{row.description}</td>
                  <td>{formatAmount(row.credit)}</td>
                  <td>{formatAmount(row.debit)}</td>
                </tr>
              )) : (<tr><td colSpan="6">No transactions found</td></tr>)}
              <tr className="report-total-row">
                <td colSpan="4" style={{ textAlign: 'right', fontWeight: 700 }}>TOTAL</td>
                <td>{totalCredit.toFixed(2)}</td>
                <td>{totalDebit.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '10px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ color: '#a0aec0', fontSize: '1rem', fontWeight: '500' }}>
            Total Transactions : <span style={{ color: '#fff', fontWeight: 'bold' }}>{totalTransactions}</span>
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
      </div>
    </div>
  );
}

export default TransactionHistory;
