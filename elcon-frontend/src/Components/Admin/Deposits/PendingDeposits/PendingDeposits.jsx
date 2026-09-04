import { useEffect, useState, useMemo } from 'react';
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
        <button key={button.label} type="button" className={button.className} aria-label={button.label} onClick={async () => {
          const nextStatus = button.label === 'Reject' ? 'Rejected' : button.label === 'Change Status' ? 'Pending' : button.label;
          const adminTransactionId = nextStatus === 'Succeed' ? window.prompt('Enter the confirmed bank transaction ID:') : '';
          if (nextStatus === 'Succeed' && !adminTransactionId?.trim()) return;
          const transactionPassword = nextStatus === 'Succeed' ? window.prompt('Enter admin transaction password to credit the E-Wallet:') : '';
          if (nextStatus === 'Succeed' && !transactionPassword) return;
          try {
            await updateDepositRequestStatus(orderNo, { status: nextStatus, adminTransactionId: adminTransactionId.trim(), transactionPassword });
            reloadRows();
          } catch (error) {
            window.alert(error?.response?.data?.message || 'Unable to update deposit status');
          }
        }}>
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

  const [filters, setFilters] = useState({ startDate: '', endDate: '', memberId: '', memberName: '', transactionId: '', paymentMode: '', utrNumber: '', status: '' });
  const [appliedFilters, setAppliedFilters] = useState({ startDate: '', endDate: '', memberId: '', memberName: '', transactionId: '', paymentMode: '', utrNumber: '', status: '' });

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
      <h2 className="section-title tds-screen-title">Pending Deposits</h2>

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
                  <td className="action-cell">{renderActionButtons(row.depositId, loadRows)}</td>
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
