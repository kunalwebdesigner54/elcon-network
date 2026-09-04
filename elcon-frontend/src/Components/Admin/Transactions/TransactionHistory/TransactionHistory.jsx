import { useEffect, useMemo, useState } from 'react';
import './TransactionHistory.css';
import { getAdminTransactionHistory } from '../../../../api/managementService';

function TransactionHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('statement');

  const [filters, setFilters] = useState({ memberId: '', transactionId: '', startDate: '', endDate: '' });
  const [appliedFilters, setAppliedFilters] = useState({ memberId: '', transactionId: '', startDate: '', endDate: '' });

  useEffect(() => {
    (async () => {
      try {
        const includeAudit = viewMode === 'audit';
        const response = await getAdminTransactionHistory(includeAudit);
        setRows(response.transactions || []);
        setCurrentPage(1);
      } catch (error) {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [viewMode]);

  const handleSearch = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      const matchMemberId = !appliedFilters.memberId || String(row.memberId || '').toLowerCase().includes(appliedFilters.memberId.toLowerCase());
      const matchTxId = !appliedFilters.transactionId || String(row.transactionId || '').toLowerCase().includes(appliedFilters.transactionId.toLowerCase());
      
      let matchStartDate = true;
      let matchEndDate = true;
      
      if (appliedFilters.startDate && row.dateTime) {
         matchStartDate = new Date(row.dateTime) >= new Date(appliedFilters.startDate);
      }
      if (appliedFilters.endDate && row.dateTime) {
         matchEndDate = new Date(row.dateTime) <= new Date(appliedFilters.endDate);
      }
      
      return matchMemberId && matchTxId && matchStartDate && matchEndDate;
    });
  }, [rows, appliedFilters]);

  const totalCredit = useMemo(() => filteredRows.reduce((sum, row) => sum + Number(row.credit || 0), 0), [filteredRows]);
  const totalDebit = useMemo(() => filteredRows.reduce((sum, row) => sum + Number(row.debit || 0), 0), [filteredRows]);
  const totalBalance = filteredRows.length ? filteredRows[filteredRows.length - 1].balance : 0;
  const totalTransactions = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / Number(pageSize)));
  const indexOfLastItem = currentPage * Number(pageSize);
  const indexOfFirstItem = indexOfLastItem - Number(pageSize);
  const visibleRows = filteredRows.slice(indexOfFirstItem, indexOfLastItem);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setLoading(true);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="admintransactionhistory-report-page">
      <h2 className="admintransactionhistory-screen-title">Transaction History</h2>

      <section className="panel admintransactionhistory-panel">
        <div className="admintransactionhistory-filter-header">
          <div className="admintransactionhistory-filter-row">
            <input type="text" name="memberId" className="text-input admintransactionhistory-filter-input" placeholder="MEMBER ID" value={filters.memberId} onChange={handleFilterChange} />
            <input type="text" name="transactionId" className="text-input admintransactionhistory-filter-input" placeholder="TRANSACTION ID" value={filters.transactionId} onChange={handleFilterChange} />
            <input type="date" name="startDate" className="text-input admintransactionhistory-filter-input" placeholder="START DATE" value={filters.startDate} onChange={handleFilterChange} />
            <input type="date" name="endDate" className="text-input admintransactionhistory-filter-input" placeholder="END DATE" value={filters.endDate} onChange={handleFilterChange} />
            <select className="select-input admintransactionhistory-filter-input admintransactionhistory-size-select" value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
              <option value="10">10</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <button className="btn-primary admintransactionhistory-search-btn" type="button" onClick={handleSearch}>SEARCH</button>
          </div>
          <div className="admintransactionhistory-header-right">
            <div className="view-toggle">
              <button 
                type="button" 
                className={`view-toggle-btn ${viewMode === 'statement' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('statement')}
              >
                Statement
              </button>
              <button 
                type="button" 
                className={`view-toggle-btn ${viewMode === 'audit' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('audit')}
              >
                Audit Log
              </button>
            </div>
          </div>
        </div>

        <div className="admintransactionhistory-export-row">
          <button type="button" className="btn-outline admintransactionhistory-export-btn">XLS</button>
          <button type="button" className="btn-outline admintransactionhistory-export-btn">PDF</button>
        </div>

        <div className="table-wrap admintransactionhistory-table-wrap">
          <table className="data-table admintransactionhistory-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>TRANSACTION DATE & TIME</th>
                <th>TRANSACTION ID</th>
                <th>MEMBER ID</th>
                <th>DESCRIPTIONS</th>
                <th>CREDIT</th>
                <th>DEBIT</th>
                <th>BALANCE</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8">Loading...</td></tr>
              ) : visibleRows.length ? visibleRows.map((row) => (
                <tr key={row.sNo}>
                  <td>{row.sNo}</td>
                  <td>{row.dateTime}</td>
                  <td>{row.transactionId}</td>
                  <td>{row.memberId}</td>
                  <td>{row.description}</td>
                  <td>{row.credit.toFixed(2)}</td>
                  <td>{row.debit.toFixed(2)}</td>
                  <td>{row.balance.toFixed(2)}</td>
                </tr>
              )) : (<tr><td colSpan="8">No transactions found</td></tr>)}
              <tr className="admintransactionhistory-summary-row">
                <td colSpan="5" style={{ textAlign: 'right', fontWeight: 700 }}>
                  TOTAL
                </td>
                <td>{totalCredit.toFixed(2)}</td>
                <td>{totalDebit.toFixed(2)}</td>
                <td>{totalBalance.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '10px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ color: '#a0aec0', fontSize: '1rem', fontWeight: '500' }}>
            Total Transactions : <span style={{ color: '#fff', fontWeight: 'bold' }}>{totalTransactions}</span>
          </div>
          <div className="admintransactionhistory-pagination" style={{ display: 'flex', gap: '5px' }}>
            <button type="button" className="admintransactionhistory-page-btn" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>«</button>
            <button type="button" className="admintransactionhistory-page-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>‹</button>
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
                    type="button"
                    className={`admintransactionhistory-page-btn ${currentPage === pageNum ? 'admintransactionhistory-active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                (pageNum === 2 && currentPage > 3) ||
                (pageNum === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return <span key={pageNum} style={{ color: '#00e5ff', padding: '0 5px' }}>...</span>;
              }
              return null;
            })}
            <button type="button" className="admintransactionhistory-page-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
            <button type="button" className="admintransactionhistory-page-btn" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>»</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TransactionHistory;
