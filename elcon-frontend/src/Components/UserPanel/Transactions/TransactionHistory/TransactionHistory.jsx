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

  useEffect(() => {
    (async () => {
      try {
        const response = await getUserTransactionHistory();
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
    <div>
      <h1 className="user-page-title">Transaction History</h1>
      <div className="user-panel">
        <h3>Total Balance: {totalBalance.toFixed(2)}</h3>

        <div className="report-filters">
          <input type="text" placeholder="TRANSACTION ID" aria-label="Transaction ID" />
          <input type="text" placeholder="START DATE" aria-label="Start Date" />
          <input type="text" placeholder="END DATE" aria-label="End Date" />
          <select aria-label="Rows per page" value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="user-btn-blue" type="button">SEARCH</button>
        </div>

        <div className="table-toolbar">
          <button className="user-btn-outline" type="button">Excel</button>
          <button className="user-btn-outline" type="button">PDF</button>
        </div>

        <div className="table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>TRANSACTION DATE & TIME</th>
                <th>TRANSACTION ID</th>
                <th>MEMBER ID</th>
                <th>DISCRIPTIONS</th>
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
                  <td>{formatAmount(row.credit)}</td>
                  <td>{formatAmount(row.debit)}</td>
                  <td>{formatAmount(row.balance)}</td>
                </tr>
              )) : (<tr><td colSpan="8">No transactions found</td></tr>)}
              <tr className="report-total-row">
                <td colSpan="5" style={{ textAlign: 'right', fontWeight: 700 }}>TOTAL</td>
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
