import { useEffect, useState, useMemo } from 'react';
import './RejectWithdrawalRequest.css';
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

function RejectWithdrawalRequest() {
  const [withdrawalRows, setWithdrawalRows] = useState([]);
  const [pageSize, setPageSize] = useState('10');
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({ requestId: '', memberId: '', amount: '', status: '', startDate: '', endDate: '' });
  const [appliedFilters, setAppliedFilters] = useState({ requestId: '', memberId: '', amount: '', status: '', startDate: '', endDate: '' });

  const loadRows = async () => {
    try {
      const response = await getAdminWithdrawalRequests('Reject');
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

  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  const filteredRows = useMemo(() => {
    return withdrawalRows.filter((row) => {
      const matchRequestId = !appliedFilters.requestId || row.requestId.toLowerCase().includes(appliedFilters.requestId.toLowerCase());
      const matchMemberId = !appliedFilters.memberId || (row.memberId || '').toLowerCase().includes(appliedFilters.memberId.toLowerCase());
      const matchAmount = !appliedFilters.amount || String(Number(row.amount || 0)).includes(appliedFilters.amount);
      const matchStatus = !appliedFilters.status || row.status === appliedFilters.status;

      let matchStartDate = true;
      let matchEndDate = true;
      if (appliedFilters.startDate && row.requestDate) {
         matchStartDate = new Date(row.requestDate) >= new Date(appliedFilters.startDate);
      }
      if (appliedFilters.endDate && row.requestDate) {
         matchEndDate = new Date(row.requestDate) <= new Date(appliedFilters.endDate);
      }

      return matchRequestId && matchMemberId && matchAmount && matchStatus && matchStartDate && matchEndDate;
    });
  }, [appliedFilters, withdrawalRows]);

  const visibleRows = filteredRows.slice(0, Number(pageSize));

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="tds-report-page">
      <h2 className="section-title tds-screen-title">Reject Withdrawal Request</h2>

      <section className="panel tds-panel">
      
        <div className="tds-filter-row">
          <input type="text" name="requestId" className="text-input tds-filter-input" placeholder="REQUEST ID" aria-label="Request ID" value={filters.requestId} onChange={handleFilterChange} />
          <input type="text" name="memberId" className="text-input tds-filter-input" placeholder="MEMBER ID" aria-label="Member ID" value={filters.memberId} onChange={handleFilterChange} />
          <input type="text" name="amount" className="text-input tds-filter-input" placeholder="AMOUNT" aria-label="Amount" value={filters.amount} onChange={handleFilterChange} />
          <select name="status" className="select-input tds-filter-input" aria-label="Status" value={filters.status} onChange={handleFilterChange}>
            <option value="">STATUS</option>
            <option value="Pending">Pending</option>
            <option value="Approve">Approve</option>
            <option value="Succeed">Succeed</option>
            <option value="Reject">Reject</option>
          </select>
          <input type="date" name="startDate" className="text-input tds-filter-input" placeholder="START DATE" aria-label="Start Date" value={filters.startDate} onChange={handleFilterChange} />
          <input type="date" name="endDate" className="text-input tds-filter-input" placeholder="END DATE" aria-label="End Date" value={filters.endDate} onChange={handleFilterChange} />
          <select className="select-input tds-filter-input tds-size-select" aria-label="Rows per page" value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="btn-primary tds-search-btn" type="button" onClick={handleSearch}>SEARCH</button>
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
                  <td>{Number(row.amount || 0).toFixed(2)}</td>
                  <td>{Number(row.charges || 0).toFixed(2)}</td>
                  <td>{Number(row.netAmount || 0).toFixed(2)}</td>
                  <td>{row.paymentMethod}</td>
                  <td>{row.status}</td>
                  <td className="action-cell">{renderActionButtons(row.requestId, loadRows)}</td>
                  <td className="remark-cell">{row.remark}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="18">No rejected withdrawal requests found</td>
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

export default RejectWithdrawalRequest;
