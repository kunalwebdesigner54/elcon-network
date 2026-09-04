import { useEffect, useState, useMemo } from 'react';
import './ApproveDeposits.css';
import { getAdminDepositRequests, updateDepositRequestStatus } from '../../../../api/paymentService';

const actionButtons = [
  { className: 'withdrawal-action-btn withdrawal-action-btn--approve', label: 'Approve', icon: '◌' },
  { className: 'withdrawal-action-btn withdrawal-action-btn--succeed', label: 'Succeed', icon: '✓' },
  { className: 'withdrawal-action-btn withdrawal-action-btn--reject', label: 'Reject', icon: '✕' },
  { className: 'withdrawal-action-btn withdrawal-action-btn--reset', label: 'Change Status', icon: '↻' }
];

function DepositActionButtons({ depositId, reloadRows }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [adminTransactionId, setAdminTransactionId] = useState('');
  const [transactionPassword, setTransactionPassword] = useState('');
  const [processing, setProcessing] = useState(false);

  const updateStatus = async (nextStatus, confirmation = {}) => {
    setProcessing(true);
    try {
      await updateDepositRequestStatus(depositId, { status: nextStatus, ...confirmation });
      await reloadRows();
      setShowConfirmModal(false);
      setAdminTransactionId('');
      setTransactionPassword('');
    } catch (error) {
      window.alert(error?.response?.data?.message || 'Unable to update deposit status');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="withdrawal-action-group" aria-label="Deposit actions">
        {actionButtons.map((button) => (
          <button key={button.label} type="button" className={button.className} aria-label={button.label} title={button.label} disabled={processing} onClick={() => {
            const nextStatus = button.label === 'Reject' ? 'Rejected' : button.label === 'Change Status' ? 'Pending' : button.label;
            if (nextStatus === 'Succeed') {
              setShowConfirmModal(true);
            } else {
              updateStatus(nextStatus);
            }
          }}>
            {button.icon}
          </button>
        ))}
      </div>
      {showConfirmModal && (
        <div className="deposit-confirm-backdrop" role="presentation" onClick={() => !processing && setShowConfirmModal(false)}>
          <div className="deposit-confirm-modal" role="dialog" aria-modal="true" aria-labelledby={`deposit-confirm-title-${depositId}`} onClick={(event) => event.stopPropagation()}>
            <h3 id={`deposit-confirm-title-${depositId}`}>Confirm Deposit</h3>
            <p>Enter the confirmed bank<br />transaction ID and admin transaction password.</p>
            <label htmlFor={`admin-transaction-id-${depositId}`}>Confirm UTR NUMBER</label>
            <input id={`admin-transaction-id-${depositId}`} type="text" value={adminTransactionId} onChange={(event) => setAdminTransactionId(event.target.value)} placeholder="Enter bank transaction ID" autoFocus disabled={processing} />
            <label htmlFor={`transaction-password-${depositId}`}>Admin Transaction Password</label>
            <input id={`transaction-password-${depositId}`} type="password" value={transactionPassword} onChange={(event) => setTransactionPassword(event.target.value)} placeholder="Enter transaction password" disabled={processing} />
            <div className="deposit-confirm-actions">
              <button type="button" className="deposit-confirm-cancel" onClick={() => setShowConfirmModal(false)} disabled={processing}>Cancel</button>
              <button type="button" className="deposit-confirm-submit" disabled={processing || !adminTransactionId.trim() || !transactionPassword} onClick={() => updateStatus('Succeed', { adminTransactionId: adminTransactionId.trim(), transactionPassword })}>
                {processing ? 'Confirming...' : 'Confirm Deposit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ApproveDeposits() {
  const [depositRows, setDepositRows] = useState([]);
  const [pageSize, setPageSize] = useState('10');
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({ startDate: '', endDate: '', memberId: '', memberName: '', transactionId: '', paymentMode: '', utrNumber: '', status: '' });
  const [appliedFilters, setAppliedFilters] = useState({ startDate: '', endDate: '', memberId: '', memberName: '', transactionId: '', paymentMode: '', utrNumber: '', status: '' });

  const loadRows = async () => {
    try {
      const response = await getAdminDepositRequests('Approve');
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

  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  const filteredRows = useMemo(() => {
    return depositRows.filter(row => {
      const matchMemberId = !appliedFilters.memberId || (row.memberId || '').toLowerCase().includes(appliedFilters.memberId.toLowerCase());
      const matchMemberName = !appliedFilters.memberName || (row.memberName || '').toLowerCase().includes(appliedFilters.memberName.toLowerCase());
      const matchTransactionId = !appliedFilters.transactionId || (row.transactionId || '').toLowerCase().includes(appliedFilters.transactionId.toLowerCase());
      const matchPaymentMode = !appliedFilters.paymentMode || (row.paymentMode || '').toLowerCase().includes(appliedFilters.paymentMode.toLowerCase());
      const matchUtr = !appliedFilters.utrNumber || (row.utrNumber || '').toLowerCase().includes(appliedFilters.utrNumber.toLowerCase());
      const matchStatus = !appliedFilters.status || row.status === appliedFilters.status;

      let matchStartDate = true;
      let matchEndDate = true;
      if (appliedFilters.startDate && row.depositDate) {
        matchStartDate = new Date(row.depositDate) >= new Date(appliedFilters.startDate);
      }
      if (appliedFilters.endDate && row.depositDate) {
        matchEndDate = new Date(row.depositDate) <= new Date(appliedFilters.endDate);
      }

      return matchMemberId && matchMemberName && matchTransactionId && matchPaymentMode && matchUtr && matchStatus && matchStartDate && matchEndDate;
    });
  }, [depositRows, appliedFilters]);

  const visibleRows = filteredRows.slice(0, Number(pageSize));

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="tds-report-page">
      <h2 className="section-title tds-screen-title">Approve Deposits</h2>

      <section className="panel tds-panel">

        <div className="tds-filter-row">
          <input type="date" name="startDate" className="text-input tds-filter-input" placeholder="Start Date" value={filters.startDate} onChange={handleFilterChange} />
          <input type="date" name="endDate" className="text-input tds-filter-input" placeholder="End Date" value={filters.endDate} onChange={handleFilterChange} />
          <input type="text" name="memberId" className="text-input tds-filter-input" placeholder="Member Id" value={filters.memberId} onChange={handleFilterChange} />
          <input type="text" name="memberName" className="text-input tds-filter-input" placeholder="Member Name" value={filters.memberName} onChange={handleFilterChange} />
          <input type="text" name="transactionId" className="text-input tds-filter-input" placeholder="Transaction ID" value={filters.transactionId} onChange={handleFilterChange} />
          <input type="text" name="paymentMode" className="text-input tds-filter-input" placeholder="Payment Mode" value={filters.paymentMode} onChange={handleFilterChange} />
          <input type="text" name="utrNumber" className="text-input tds-filter-input" placeholder="Utr Number" value={filters.utrNumber} onChange={handleFilterChange} />
          <select name="status" className="select-input tds-filter-input" value={filters.status} onChange={handleFilterChange}>
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
          <button className="btn-primary tds-search-btn" type="button" onClick={handleSearch}>SEARCH</button>
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
                   <td>{Number(row.amount || 0).toFixed(2)}</td>
                   <td>{row.utrNumber}</td>
                  <td>
                    <button type="button" className="deposit-slip-btn" onClick={() => row.slip && window.open(row.slip, '_blank')}>
                      VIEW
                    </button>
                  </td>
                  <td>{row.status}</td>
                  <td className="action-cell"><DepositActionButtons depositId={row.depositId} reloadRows={loadRows} /></td>
                  <td className="remark-cell">{row.remark}</td>
                </tr>
              )) : (<tr><td colSpan="13">No approved deposits found</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default ApproveDeposits;
