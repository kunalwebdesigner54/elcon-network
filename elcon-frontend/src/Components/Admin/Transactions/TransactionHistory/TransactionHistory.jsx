import { useEffect, useMemo, useState } from 'react';
import './TransactionHistory.css';
import { getAdminTransactionHistory } from '../../../../api/managementService';

function TransactionHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState('10');

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

  const totalCredit = useMemo(() => rows.reduce((sum, row) => sum + Number(row.credit || 0), 0), [rows]);
  const totalDebit = useMemo(() => rows.reduce((sum, row) => sum + Number(row.debit || 0), 0), [rows]);
  const totalBalance = rows.length ? rows[rows.length - 1].balance : 0;
  const visibleRows = rows.slice(0, Number(pageSize));

  return (
    <div className="admintransactionhistory-report-page">
      <h2 className="admintransactionhistory-screen-title">Transaction History</h2>

      <section className="panel admintransactionhistory-panel">
        <div className="admintransactionhistory-filter-row">
          <input className="text-input admintransactionhistory-filter-input" placeholder="MEMBER ID" />
          <input className="text-input admintransactionhistory-filter-input" placeholder="TRANSACTION ID" />
          <input className="text-input admintransactionhistory-filter-input" type="date" placeholder="START DATE" />
          <input className="text-input admintransactionhistory-filter-input" type="date" placeholder="END DATE" />
          <select className="select-input admintransactionhistory-filter-input admintransactionhistory-size-select" value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="btn-primary admintransactionhistory-search-btn" type="button">SEARCH</button>
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