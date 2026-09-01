import { useEffect, useMemo, useState } from 'react';
import './TransactionHistory.css';
import { getAdminTransactionHistory } from '../../../../api/managementService';

function TransactionHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState('10');

  const [filters, setFilters] = useState({ memberId: '', transactionId: '', startDate: '', endDate: '' });
  const [appliedFilters, setAppliedFilters] = useState({ memberId: '', transactionId: '', startDate: '', endDate: '' });

  useEffect(() => {
    (async () => {
      try {
        const response = await getAdminTransactionHistory();
        setRows(response.transactions || []);
      } catch (error) {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = () => {
    setAppliedFilters(filters);
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
  const visibleRows = filteredRows.slice(0, Number(pageSize));

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="admintransactionhistory-report-page">
      <h2 className="admintransactionhistory-screen-title">Transaction History</h2>

      <section className="panel admintransactionhistory-panel">
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

        <div className="admintransactionhistory-table-footer">
          <div className="admintransactionhistory-pagination">
            <button className="admintransactionhistory-page-btn">«</button>
            <button className="admintransactionhistory-page-btn">‹</button>
            <button className="admintransactionhistory-page-btn admintransactionhistory-active">1</button>
            <button className="admintransactionhistory-page-btn">2</button>
            <button className="admintransactionhistory-page-btn">3</button>
            <button className="admintransactionhistory-page-btn">4</button>
            <button className="admintransactionhistory-page-btn">5</button>
            <button className="admintransactionhistory-page-btn">6</button>
            <button className="admintransactionhistory-page-btn">7</button>
            <button className="admintransactionhistory-page-btn">›</button>
            <button className="admintransactionhistory-page-btn">»</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TransactionHistory;
