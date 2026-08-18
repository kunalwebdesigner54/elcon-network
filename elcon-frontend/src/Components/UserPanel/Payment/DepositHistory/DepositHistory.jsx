import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Common/UserLayout.css';
import './DepositHistory.css';
import { getMyDepositHistory } from '../../../../api/paymentService';

const normalizeStatus = (status) => (status === 'Reject' ? 'Rejected' : status);

const getStatusMeta = (status) => {
  switch (normalizeStatus(status)) {
    case 'Pending':
      return { className: 'deposit-status deposit-status--pending', icon: '◔', label: 'Pending' };
    case 'Approve':
      return { className: 'deposit-status deposit-status--approve', icon: '◌', label: 'Approve' };
    case 'Succeed':
      return { className: 'deposit-status deposit-status--succeed', icon: '✓', label: 'Succeed' };
    case 'Rejected':
      return { className: 'deposit-status deposit-status--reject', icon: '✕', label: 'Reject' };
    default:
      return { className: 'deposit-status', icon: '', label: status || '' };
  }
};

function DepositHistory() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ transactionId: '', amount: '', status: '', pageSize: '10' });
  const [depositRows, setDepositRows] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await getMyDepositHistory();
        setDepositRows(response.data || []);
      } catch (error) {
        setDepositRows([]);
      }
    };

    loadHistory();
  }, []);

  const filteredRows = useMemo(() => {
    return depositRows.filter((row) => {
      const byTransaction = !filters.transactionId || row.transactionId.includes(filters.transactionId.trim());
      const byAmount = !filters.amount || String(row.amount).includes(filters.amount.trim());
      const byStatus = !filters.status || normalizeStatus(row.status) === normalizeStatus(filters.status);
      return byTransaction && byAmount && byStatus;
    });
  }, [depositRows, filters]);

  const visibleRows = filteredRows.slice(0, Number(filters.pageSize));

  return (
    <div>
      <h1 className="user-page-title">Deposit History</h1>
      <div className="user-panel deposit-history-panel">
        <div className="report-filters deposit-report-filters">
          <input
            type="text"
            placeholder="TRANSACTION ID"
            aria-label="Transaction ID"
            value={filters.transactionId}
            onChange={(event) => setFilters((prev) => ({ ...prev, transactionId: event.target.value }))}
          />
          <input
            type="text"
            placeholder="AMOUNT"
            aria-label="Amount"
            value={filters.amount}
            onChange={(event) => setFilters((prev) => ({ ...prev, amount: event.target.value }))}
          />
          <select
            aria-label="Status"
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          >
            <option value="">STATUS</option>
            <option value="Pending">Pending</option>
            <option value="Approve">Approve</option>
            <option value="Succeed">Succeed</option>
            <option value="Reject">Reject</option>
          </select>
          <input type="text" placeholder="START DATE" aria-label="Start Date" />
          <input type="text" placeholder="END DATE" aria-label="End Date" />
          <select
            aria-label="Rows per page"
            value={filters.pageSize}
            onChange={(event) => setFilters((prev) => ({ ...prev, pageSize: event.target.value }))}
          >
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="user-btn-blue" type="button">SEARCH</button>
        </div>

        <div className="table-toolbar">
          <button className="user-btn-red deposit-add-btn" type="button" onClick={() => navigate('/user/deposit/add-funds')}>
            ADD FUND
          </button>
        </div>

        <div className="table-wrap deposit-table-wrap">
          <table className="user-table deposit-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>DEPOSIT DATE</th>
                <th>TRANSACTION ID</th>
                <th>PAY METHOD</th>
                <th>AMOUNT</th>
                <th>UTR NUMBER</th>
                <th>SLIP</th>
                <th>STATUS</th>
                <th>DETAILS</th>
                <th>DESCRIPTION</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length > 0 ? visibleRows.map((row) => {
                const meta = getStatusMeta(row.status);

                return (
                  <tr key={`${row.transactionId}-${row.sNo}`}>
                    <td>{row.sNo}</td>
                    <td>{row.depositDate}</td>
                    <td>{row.transactionId}</td>
                    <td>{row.payMethod}</td>
                    <td>{row.amount.toFixed(2)}</td>
                    <td>{row.utrNumber}</td>
                    <td>
                      <button
                        type="button"
                        className="deposit-slip-btn"
                        onClick={() => {
                          if (row.slip) {
                            window.open(row.slip, '_blank', 'noopener,noreferrer');
                          }
                        }}
                      >
                        VIEW
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={meta.className}
                        aria-label={meta.label}
                      >
                        {meta.icon}
                      </button>
                    </td>
                    <td className="details-cell">
                      <button
                        type="button"
                        className="deposit-details-btn"
                        onClick={() => {
                          window.alert(
                            `Transaction ID: ${row.transactionId}\nAmount: ₹${Number(row.amount || 0).toFixed(2)}\nStatus: ${normalizeStatus(row.status)}\nPayment Mode: ${row.paymentMode}`
                          );
                        }}
                      >
                        D
                      </button>
                    </td>
                    <td>{row.description}</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="10">No deposit requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DepositHistory;