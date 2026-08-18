import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Common/UserLayout.css';
import './WithdrawalHistory.css';
import { getMyWithdrawalHistory } from '../../../../api/paymentService';

function getStatusIcon(status) {
  switch (status) {
    case 'Pending':
      return { className: 'withdrawal-detail-btn withdrawal-detail-btn--pending', label: 'Pending', icon: '▭' };
    case 'Approve':
      return { className: 'withdrawal-detail-btn withdrawal-detail-btn--approve', label: 'Approve', icon: '◌' };
    case 'Succeed':
      return { className: 'withdrawal-detail-btn withdrawal-detail-btn--succeed', label: 'Succeed', icon: '✓' };
    case 'Reject':
      return { className: 'withdrawal-detail-btn withdrawal-detail-btn--reject', label: 'Reject', icon: '✕' };
    default:
      return { className: 'withdrawal-detail-btn', label: status, icon: '' };
  }
}

function WithdrawalHistory() {
  const navigate = useNavigate();
  const [withdrawalData, setWithdrawalData] = useState([]);
  const [filters, setFilters] = useState({ requestId: '', amount: '', status: '', startDate: '', endDate: '' });
  const [pageSize, setPageSize] = useState('10');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await getMyWithdrawalHistory();
        setWithdrawalData(response.data || []);
      } catch (error) {
        setWithdrawalData([]);
      }
    };

    loadHistory();
  }, []);

  const filteredRows = useMemo(() => {
    return withdrawalData.filter((row) => {
      const byRequestId = !filters.requestId || row.requestId.toLowerCase().includes(filters.requestId.toLowerCase());
      const byAmount = !filters.amount || String(Number(row.amount || 0)).includes(filters.amount);
      const byStatus = !filters.status || row.status === filters.status;
      return byRequestId && byAmount && byStatus;
    });
  }, [filters, withdrawalData]);

  const visibleRows = filteredRows.slice(0, Number(pageSize));
  
  const handleWithdrawalNow = () => {
    navigate('/user/payment/withdraw');
  };

  return (
    <div>
      <h1 className="user-page-title">Withdrawal History</h1>
      <div className="user-panel">
        <div className="report-filters">
          <input type="text" placeholder="REQUEST ID" aria-label="Request ID" value={filters.requestId} onChange={(event) => setFilters((prev) => ({ ...prev, requestId: event.target.value }))} />
          <input type="text" placeholder="AMOUNT" aria-label="Amount" value={filters.amount} onChange={(event) => setFilters((prev) => ({ ...prev, amount: event.target.value }))} />
          <select aria-label="Status" value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
            <option value="">STATUS</option>
            <option value="Pending">Pending</option>
            <option value="Approve">Approve</option>
            <option value="Succeed">Succeed</option>
            <option value="Reject">Reject</option>
          </select>
          <input type="text" placeholder="START DATE" aria-label="Start Date" value={filters.startDate} onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))} />
          <input type="text" placeholder="END DATE" aria-label="End Date" value={filters.endDate} onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))} />
          <select aria-label="Rows per page" value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="user-btn-blue" type="button">SEARCH</button>
        </div>

        <div className="table-toolbar">
          <button className="user-btn-red" type="button" onClick={handleWithdrawalNow}>Withdrawal Now</button>
        </div>

        <div className="table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>REQUEST DATE</th>
                <th>REQUEST ID</th>
                <th>AMOUNT</th>
                <th>CHARGES</th>
                <th>NET AMOUNT</th>
                <th>PAYMENT METHOD</th>
                <th>STATUS</th>
                <th>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length > 0 ? visibleRows.map((row) => (
                <tr key={row.sNo}>
                  <td>{row.sNo}</td>
                  <td>{row.requestDate}</td>
                  <td>{row.requestId}</td>
                  <td>{row.amount.toFixed(2)}</td>
                  <td>{row.charges.toFixed(2)}</td>
                  <td>{row.netAmount.toFixed(2)}</td>
                  <td>{row.paymentMethod}</td>
                  <td>{row.status}</td>
                  <td className="details-cell">
                    <button
                      type="button"
                      className={getStatusIcon(row.status).className}
                      aria-label={getStatusIcon(row.status).label}
                    >
                      {getStatusIcon(row.status).icon}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9">No withdrawal requests found</td>
                </tr>
              )}
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
          <button className="page-btn">›</button>
          <button className="page-btn">»</button>
        </div>
      </div>
    </div>
  );
}

export default WithdrawalHistory;
