import { useEffect, useMemo, useState } from 'react';
import '../../Common/UserLayout.css';
import './TransactionHistory.css';
import { getUserTransactionHistory } from '../../../../api/managementService';

function formatAmount(value) {
  return Number(value || 0).toFixed(2);
}

function TransactionHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState('10');
  const [viewMode, setViewMode] = useState('statement');

  const [filters, setFilters] = useState({ transactionId: '', startDate: '', endDate: '' });
  const [appliedFilters, setAppliedFilters] = useState({ transactionId: '', startDate: '', endDate: '' });

  useEffect(() => {
    (async () => {
      try {
        const includeAudit = viewMode === 'audit';
        const response = await getUserTransactionHistory(includeAudit);
        setRows(response.transactions || []);
      } catch (error) {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [viewMode]);

  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      const matchTxId = !appliedFilters.transactionId || String(row.transactionId || '').toLowerCase().includes(appliedFilters.transactionId.toLowerCase());
      
      let matchStartDate = true;
      let matchEndDate = true;
      
      if (appliedFilters.startDate && row.dateTime) {
         matchStartDate = new Date(row.dateTime) >= new Date(appliedFilters.startDate);
      }
      if (appliedFilters.endDate && row.dateTime) {
         matchEndDate = new Date(row.dateTime) <= new Date(appliedFilters.endDate);
      }
      
      return matchTxId && matchStartDate && matchEndDate;
    });
  }, [rows, appliedFilters]);

  const totalCredit = useMemo(() => filteredRows.reduce((sum, row) => sum + Number(row.credit || 0), 0), [filteredRows]);
  const totalDebit = useMemo(() => filteredRows.reduce((sum, row) => sum + Number(row.debit || 0), 0), [filteredRows]);
  const totalBalance = filteredRows.length ? filteredRows[filteredRows.length - 1].balance : 0;
  const visibleRows = filteredRows.slice(0, Number(pageSize));

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setLoading(true);
  };

  return (
    <div>
      <h1 className="user-page-title">Transaction History</h1>
      <div className="user-panel">
        <div className="transaction-header">
          <h3>Total Balance: {totalBalance ? Number(totalBalance).toFixed(2) : '0.00'}</h3>
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
                <th>MEMBER ID</th>
                <th>MEMBER NAME</th>
                <th>DISCRIPTIONS</th>
                <th>CREDIT</th>
                <th>DEBIT</th>
                <th>BALANCE</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9">Loading...</td></tr>
              ) : visibleRows.length ? visibleRows.map((row) => (
                <tr key={row.sNo}>
                  <td>{row.sNo}</td>
                  <td>{row.dateTime}</td>
                  <td>{row.transactionId}</td>
                  <td>{row.memberId}</td>
                  <td>{row.memberName}</td>
                  <td>{row.description}</td>
                  <td>{formatAmount(row.credit)}</td>
                  <td>{formatAmount(row.debit)}</td>
                  <td>{formatAmount(row.balance)}</td>
                </tr>
              )) : (<tr><td colSpan="9">No transactions found</td></tr>)}
              <tr className="report-total-row">
                <td colSpan="6" style={{ textAlign: 'right', fontWeight: 700 }}>TOTAL</td>
                <td>{totalCredit.toFixed(2)}</td>
                <td>{totalDebit.toFixed(2)}</td>
                <td>{totalBalance.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pagination-row">
          <button className="page-btn">«</button>
          <button className="page-btn">‹</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <button className="page-btn">4</button>
          <button className="page-btn">5</button>
          <button className="page-btn">6</button>
          <button className="page-btn">7</button>
          <button className="page-btn">›</button>
          <button className="page-btn">»</button>
        </div>
      </div>
    </div>
  );
}

export default TransactionHistory;
