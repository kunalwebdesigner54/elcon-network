import { useEffect, useState } from 'react';
import './PendingDeposits.css';
import { getAdminDepositRequests, updateDepositRequestStatus } from '../../../../api/paymentService';

const actionButtons = [
  { className: 'withdrawal-action-btn withdrawal-action-btn--approve', label: 'Approve', icon: '◌' },
  { className: 'withdrawal-action-btn withdrawal-action-btn--succeed', label: 'Succeed', icon: '✓' },
  { className: 'withdrawal-action-btn withdrawal-action-btn--reject', label: 'Reject', icon: '✕' },
  { className: 'withdrawal-action-btn withdrawal-action-btn--reset', label: 'Change Status', icon: '↻' }
];

function renderActionButtons(orderNo, reloadRows) {
  return (
    <div className="withdrawal-action-group" aria-label="Deposit actions">
      {actionButtons.map((button) => (
        <button key={button.label} type="button" className={button.className} aria-label={button.label} onClick={async () => { const nextStatus = button.label === 'Reject' ? 'Rejected' : button.label === 'Change Status' ? 'Pending' : button.label; await updateDepositRequestStatus(orderNo, { status: nextStatus }); reloadRows(); }}>
          {button.icon}
        </button>
      ))}
    </div>
  );
}

function PendingDeposits() {
  const [depositRows, setDepositRows] = useState([]);
  const [pageSize, setPageSize] = useState('10');
  const [loading, setLoading] = useState(true);

  const loadRows = async () => {
    try {
      const response = await getAdminDepositRequests('Pending');
      setDepositRows(response.data || []);
    } catch (error) {
      setDepositRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const visibleRows = depositRows.slice(0, Number(pageSize));

  return (
    <div className="tds-report-page">
      <h2 className="section-title tds-screen-title">Pending Deposits</h2>

      <section className="panel tds-panel">
        

        <div className="tds-filter-row">
          <input className="text-input tds-filter-input" placeholder="Start Date" />
          <input className="text-input tds-filter-input" placeholder="End Date" />
          <input className="text-input tds-filter-input" placeholder="Member Id" />
          <input className="text-input tds-filter-input" placeholder="Member Name" />
          <input className="text-input tds-filter-input" placeholder="Transaction ID" />
          <input className="text-input tds-filter-input" placeholder="Payment Mode" />
          <input className="text-input tds-filter-input" placeholder="Utr Number" />
          <select className="select-input tds-filter-input" defaultValue="">
            <option value="">Status</option>
            <option value="Pending">Pending</option>
            <option value="Approve">Approve</option>
            <option value="Succeed">Succeed</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select className="select-input tds-filter-input tds-size-select" value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="btn-primary tds-search-btn" type="button">SERCH</button>
        </div>

        <div className="btn-row tds-export-row" aria-label="Export options">
          <button type="button" className="btn-outline tds-export-btn" aria-label="Export Excel">XLS</button>
          <button type="button" className="btn-outline tds-export-btn" aria-label="Export PDF">PDF</button>
        </div>

        <div className="table-wrap tds-table-wrap">
          <table className="data-table tds-table">
            <thead>
              <tr>
                <th>S.no</th>
                <th>Deposit Date</th>
                <th>Member Id</th>
                <th>Member Name</th>
                <th>Mobile No</th>
                <th>Trasaction ID</th>
                <th>Payment Mode</th>
                <th>AMOUNT</th>
                <th>UTR NUMBER</th>
                <th>SLIP</th>
                <th>Status</th>
                <th>Action</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="13">Loading...</td></tr>
              ) : visibleRows.length > 0 ? visibleRows.map((row) => (
                <tr key={`${row.sno}-${row.transactionId}`}>
                  <td>{row.sno}</td>
                  <td>{row.depositDate}</td>
                  <td>{row.memberId}</td>
                  <td>{row.memberName}</td>
                  <td>{row.mobileNo}</td>
                  <td>{row.transactionId}</td>
                  <td>{row.paymentMode}</td>
                  <td>{Number(row.amount).toFixed(2)}</td>
                  <td>{row.utrNumber}</td>
                  <td><button type="button" className="deposit-slip-btn">VIEW</button></td>
                  <td>{row.status}</td>
                  <td className="action-cell">{renderActionButtons(row.transactionId, loadRows)}</td>
                  <td className="remark-cell">{row.remark}</td>
                </tr>
              )) : (<tr><td colSpan="13">No pending deposits found</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default PendingDeposits;
