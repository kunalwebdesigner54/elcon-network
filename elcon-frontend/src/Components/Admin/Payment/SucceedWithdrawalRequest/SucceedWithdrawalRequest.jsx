import { useEffect, useState } from 'react';
import './SucceedWithdrawalRequest.css';
import { getAdminWithdrawalRequests, updateWithdrawalRequestStatus } from '../../../../api/paymentService';

const actionButtons = [
  { className: 'withdrawal-action-btn withdrawal-action-btn--approve', label: 'Approve', icon: '◌' },
  { className: 'withdrawal-action-btn withdrawal-action-btn--succeed', label: 'Succeed', icon: '✓' },
  { className: 'withdrawal-action-btn withdrawal-action-btn--reject', label: 'Reject', icon: '✕' },
  { className: 'withdrawal-action-btn withdrawal-action-btn--reset', label: 'Change Status', icon: '↻' }
];

function renderActionButtons(requestId, reloadRows) {
  return (
    <div className="withdrawal-action-group" aria-label="Withdrawal actions">
      {actionButtons.map((button) => (
        <button
          key={button.label}
          type="button"
          className={button.className}
          aria-label={button.label}
          onClick={async () => {
            const nextStatus = button.label === 'Change Status' ? 'Pending' : button.label;
            await updateWithdrawalRequestStatus(requestId, { status: nextStatus });
            reloadRows();
          }}
        >
          {button.icon}
        </button>
      ))}
    </div>
  );
}

function SucceedWithdrawalRequest() {
  const [withdrawalRows, setWithdrawalRows] = useState([]);
  const [pageSize, setPageSize] = useState('10');
  const [loading, setLoading] = useState(true);

  const loadRows = async () => {
    try {
      const response = await getAdminWithdrawalRequests('Succeed');
      setWithdrawalRows(response.data || []);
    } catch (error) {
      setWithdrawalRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const visibleRows = withdrawalRows.slice(0, Number(pageSize));

  return (
    <div className="tds-report-page">
      <h2 className="section-title tds-screen-title">Succeed Withdrawal Request</h2>

      <section className="panel tds-panel">
       
        <div className="tds-filter-row">
          <input className="text-input tds-filter-input" placeholder="REQUEST ID" aria-label="Request ID" />
          <input className="text-input tds-filter-input" placeholder="MEMBER ID" aria-label="Member ID" />
          <input className="text-input tds-filter-input" placeholder="AMOUNT" aria-label="Amount" />
          <input className="text-input tds-filter-input" placeholder="START DATE" aria-label="Start Date" />
          <input className="text-input tds-filter-input" placeholder="END DATE" aria-label="End Date" />
          <select className="select-input tds-filter-input tds-size-select" aria-label="Rows per page" value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="btn-primary tds-search-btn" type="button">SERCH</button>
        </div>


         <div className="btn-row tds-export-row">
          <button type="button" className="btn-outline tds-export-btn">XLS</button>
          <button type="button" className="btn-outline tds-export-btn">PDF</button>
        </div>


        <div className="table-wrap tds-table-wrap">
          <table className="data-table tds-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>REQUEST DATE</th>
                <th>REQUEST ID</th>
                <th>MEMBER ID</th>
                <th>MEMBER NAME</th>
                <th>MOBILE NO</th>
                <th>UPI ID</th>
                <th>BANK ACC NO</th>
                <th>BANK NAME</th>
                <th>BRANCH</th>
                <th>IFSC CODE</th>
                <th>AMOUNT</th>
                <th>CHARGES</th>
                <th>NET AMOUNT</th>
                <th>PAYMENT METHOD</th>
                <th>STATUS</th>
                <th>ACTION</th>
                <th>REMARK</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="18">Loading...</td>
                </tr>
              ) : visibleRows.length > 0 ? visibleRows.map((row) => (
                <tr key={row.sNo}>
                  <td>{row.sNo}</td>
                  <td>{row.requestDate}</td>
                  <td>{row.requestId}</td>
                  <td>{row.memberId}</td>
                  <td>{row.memberName}</td>
                  <td>{row.mobileNo}</td>
                  <td>{row.upiId}</td>
                  <td>{row.bankAccountNo}</td>
                  <td>{row.bankName}</td>
                  <td>{row.branch}</td>
                  <td>{row.ifscCode}</td>
                  <td>{row.amount.toFixed(2)}</td>
                  <td>{row.charges.toFixed(2)}</td>
                  <td>{row.netAmount.toFixed(2)}</td>
                  <td>{row.paymentMethod}</td>
                  <td>{row.status}</td>
                  <td className="action-cell">{renderActionButtons(row.requestId, loadRows)}</td>
                  <td className="remark-cell">{row.remark}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="18">No succeeded withdrawal requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="pagination">
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
      </section>
    </div>
  );
}

export default SucceedWithdrawalRequest;
