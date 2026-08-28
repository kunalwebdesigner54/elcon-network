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
    case 'Approved':
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
  const [filters, setFilters] = useState({ transactionId: '', amount: '', status: '', startDate: '', endDate: '', pageSize: '10' });
  const [appliedFilters, setAppliedFilters] = useState({ transactionId: '', amount: '', status: '', startDate: '', endDate: '', pageSize: '10' });
  const [depositRows, setDepositRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await getMyDepositHistory();
        setDepositRows(response.data || []);
      } catch (error) {
        setDepositRows([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  const filteredRows = useMemo(() => {
    return depositRows.filter((row) => {
      const byTransaction = !appliedFilters.transactionId || String(row.transactionId || '').toLowerCase().includes(appliedFilters.transactionId.trim().toLowerCase());
      const byAmount = !appliedFilters.amount || String(row.amount || '').includes(appliedFilters.amount.trim());
      const byStatus = !appliedFilters.status || normalizeStatus(row.status) === normalizeStatus(appliedFilters.status);

      let byStartDate = true;
      let byEndDate = true;
      if (appliedFilters.startDate && row.depositDate) {
         byStartDate = new Date(row.depositDate) >= new Date(appliedFilters.startDate);
      }
      if (appliedFilters.endDate && row.depositDate) {
         byEndDate = new Date(row.depositDate) <= new Date(appliedFilters.endDate);
      }

      return byTransaction && byAmount && byStatus && byStartDate && byEndDate;
    });
  }, [depositRows, appliedFilters]);

  const visibleRows = filteredRows.slice(0, Number(appliedFilters.pageSize || '10'));

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
          <input 
            type="date" 
            placeholder="START DATE" 
            aria-label="Start Date" 
            value={filters.startDate}
            onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))}
          />
          <input 
            type="date" 
            placeholder="END DATE" 
            aria-label="End Date" 
            value={filters.endDate}
            onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))}
          />
          <select
            aria-label="Rows per page"
            value={filters.pageSize}
            onChange={(event) => setFilters((prev) => ({ ...prev, pageSize: event.target.value }))}
          >
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="user-btn-blue" type="button" onClick={handleSearch}>SEARCH</button>
        </div>

        <div className="table-toolbar">
          <button className="user-btn-red deposit-add-btn" type="button" onClick={() => navigate('/user/deposit/add-funds')}>
            ADD FUND
          </button>
        </div>

        <div className="table-wrap deposit-table-wrap">
          <table className="data-table deposit-table">
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
              {loading ? (
                <tr>
                  <td colSpan="10">Loading...</td>
                </tr>
              ) : visibleRows.length > 0 ? visibleRows.map((row) => {
                const meta = getStatusMeta(row.status);

                return (
                  <tr key={`${row.transactionId}-${row.sNo || Math.random()}`}>
                    <td>{row.sNo}</td>
                    <td>{row.depositDate}</td>
                    <td>{row.transactionId}</td>
                    <td>{row.payMethod || row.paymentMode}</td>
                    <td>{Number(row.amount || 0).toFixed(2)}</td>
                    <td>{row.utrNumber || row.utr}</td>
                    <td>
                      <button
                        type="button"
                        className="deposit-slip-btn"
                        onClick={() => {
                          if (row.slip) {
                            window.open(row.slip, '_blank', 'noopener,noreferrer');
                          } else {
                            window.alert('No slip available.');
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
                            `Transaction ID: ${row.transactionId || 'N/A'}\nAmount: ₹${Number(row.amount || 0).toFixed(2)}\nStatus: ${normalizeStatus(row.status) || 'N/A'}\nPayment Mode: ${row.paymentMode || row.payMethod || 'N/A'}`
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
