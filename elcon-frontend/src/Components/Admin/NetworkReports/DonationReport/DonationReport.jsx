import { useMemo, useState, useEffect } from 'react';
import { getAllDonations, updateDonationStatus } from '../../../../api/donationsService';
import './DonationReport.css';

const exportColumns = [
  'S.No', 'Donor Member ID', 'Donor Member Name', 'Receiver Member ID', 'Receiver Member Name', 'D. Amount',
  'Rank', 'Request Date', 'Approve Date', 'Transaction ID', 'UTR Number', 'Status'
];

const rankLabels = {
  '1': 'Starter',
  '2': 'Achiever',
  '3': 'Performer',
  '4': 'Leader',
  '5': 'Silver Leader',
  '6': 'Gold Leader',
  '7': 'Platinum Leader',
  '8': 'Diamond Leader',
  '9': 'Crown Leader',
  '10': 'Royal Crown'
};

function parseDate(value) {
  if (!value || value === '\u2014') return '';
  const datePart = typeof value === 'string' ? value.split(' ')[0] : '';
  if (!datePart) return value;
  const parts = datePart.split('-');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }
  return value;
}

import { formatDate } from '../../../../utils/dateFormatter';

function formatDateTime(value) {
  return formatDate(value);
}
function DonationReport() {
  const [donationRows, setDonationRows] = useState([]);
  const [filters, setFilters] = useState({
    donorMemberId: '',
    receiverMemberId: '',
    amount: '',
    rank: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [pageSize, setPageSize] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const data = await getAllDonations();
      const donations = Array.isArray(data) ? data : (data.data ? data.data : []);
      setDonationRows(donations.map((donation, index) => ({
        srNo: index + 1,
        donorMemberId: donation.fromMemberId || 'N/A',
        donorMemberName: donation.fromName || 'N/A',
        receiverMemberId: donation.toMemberId || 'N/A',
        receiverMemberName: donation.toName || 'N/A',
        amount: donation.amount ? String(donation.amount) : '0',
        rank: donation.level ? String(donation.level) : '',
        paymentProof: donation.utrNumber !== '---' ? donation.utrNumber : '',
        transactionId: donation.donationId || '',
        requestDate: formatDateTime(donation.dateRaw),
        approveDate: ['APPROVED', 'COMPLETED'].includes(donation.status) ? formatDateTime(donation.reviewedAt) : '\u2014',
        status: donation.status || 'PENDING'
      })));
      setError('');
    } catch (err) {
      setError('Failed to load donations');
      console.error(err);
      setDonationRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (donationId, status) => {
    if (!window.confirm(`Are you sure you want to mark this donation as ${status}?`)) return;
    try {
      setLoading(true);
      await updateDonationStatus(donationId, status);
      await fetchDonations();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update status');
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    return donationRows.filter((row) => {
      const byDonorId = !filters.donorMemberId || row.donorMemberId.toLowerCase().includes(filters.donorMemberId.toLowerCase());
      const byReceiverId = !filters.receiverMemberId || row.receiverMemberId.toLowerCase().includes(filters.receiverMemberId.toLowerCase());
      const byAmount = !filters.amount || row.amount.includes(filters.amount);
      const byRank = !filters.rank || row.rank === filters.rank;
      const byStatus = !filters.status || row.status === filters.status;

      const rowDate = parseDate(row.requestDate);
      const byStartDate = !filters.startDate || rowDate >= filters.startDate;
      const byEndDate = !filters.endDate || rowDate <= filters.endDate;

      return byDonorId && byReceiverId && byAmount && byRank && byStatus && byStartDate && byEndDate;
    });
  }, [filters, donationRows]);

  const visibleRows = filteredRows.slice(0, Number(pageSize));

  const handleFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const formatRowsForExport = (rows) => rows.map((row) => ([
    row.srNo,
    row.donorMemberId,
    row.donorMemberName,
    row.receiverMemberId,
    row.receiverMemberName,
    row.amount,
    row.rank,
    row.requestDate,
    row.approveDate,
    row.transactionId,
    row.paymentProof,
    row.status
  ]));

  const handleExportExcel = () => {
    const csvRows = [exportColumns, ...formatRowsForExport(filteredRows)]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'donation-report.csv');
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const tableRows = formatRowsForExport(filteredRows)
      .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
      .join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Donation Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            h2 { margin: 0 0 12px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #d6d6d6; padding: 6px; font-size: 14px; text-align: left; }
            th { background: #e8f6fb; }
          </style>
        </head>
        <body>
          <h2>Donation Report</h2>
          <table>
            <thead>
              <tr>${exportColumns.map((column) => `<th>${column}</th>`).join('')}</tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div>
      <h2 className="section-title tds-screen-title">Donation Report</h2>

      <div className="panel" style={{ borderRadius: '28px', padding: '24px' }}>
        {error && <div style={{ color: '#e74c3c', marginBottom: '14px' }}>{error}</div>}
        {loading && <div style={{ color: '#666', marginBottom: '14px' }}>Loading donations...</div>}
        
        {!loading && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
              <input className="text-input" style={{ maxWidth: '150px' }} placeholder="DONAR MEMBER ID" value={filters.donorMemberId} onChange={handleFilterChange('donorMemberId')} />
              <input className="text-input" style={{ maxWidth: '160px' }} placeholder="RECEIVER MEMBER ID" value={filters.receiverMemberId} onChange={handleFilterChange('receiverMemberId')} />
              <input className="text-input" style={{ maxWidth: '110px' }} placeholder="D. AMOUNT" value={filters.amount} onChange={handleFilterChange('amount')} />
              <select className="select-input" style={{ maxWidth: '98px' }} value={filters.rank} onChange={handleFilterChange('rank')}>
                <option value="">RANK</option>
                {Object.keys(rankLabels).map((rankKey) => (
                  <option key={rankKey} value={rankKey}>{rankKey}</option>
                ))}
              </select>
              <select className="select-input" style={{ maxWidth: '120px' }} value={filters.status} onChange={handleFilterChange('status')}>
                <option value="">STATUS</option>
                <option value="PENDING">PENDING</option>
                <option value="WAITING_FOR_RECEIVER_CONFIRMATION">WAITING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
              <input className="text-input" type="date" style={{ maxWidth: '130px' }} value={filters.startDate} onChange={handleFilterChange('startDate')} />
              <input className="text-input" type="date" style={{ maxWidth: '120px' }} value={filters.endDate} onChange={handleFilterChange('endDate')} />
              <select className="select-input" style={{ maxWidth: '92px' }} value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <button className="btn-primary" type="button">Search</button>
            </div>

            <div className="btn-row" style={{ justifyContent: 'flex-end', marginBottom: '14px' }}>
              <button className="btn-outline" type="button" onClick={handleExportPdf}>Export PDF</button>
              <button className="btn-outline" type="button" onClick={handleExportExcel}>Export Excel</button>
            </div>

            <div className="table-wrap">
              <table className="data-table" style={{ minWidth: '1680px' }}>
                <thead>
                  <tr>
                    <th>S.NO</th>
                    <th>DONAR MID</th>
                    <th>DONAR MEMBER NAME</th>
                    <th>RECEIVER MID</th>
                    <th>RECEIVER MEMBER NAME</th>
                    <th>D. AMOUNT</th>
                    <th>RANK</th>
                    <th>REQUEST DATE</th>
                    <th>APPROVE DATE</th>
                    <th>TRANSACTION ID</th>
                    <th>UTR NUMBER</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.srNo}>
                      <td>{row.srNo}</td>
                      <td>{row.donorMemberId}</td>
                      <td>{row.donorMemberName}</td>
                      <td>{row.receiverMemberId}</td>
                      <td>{row.receiverMemberName}</td>
                      <td>{row.amount}</td>
                      <td>{row.rank}</td>
                      <td>{row.requestDate}</td>
                      <td>{row.approveDate}</td>
                      <td>{row.transactionId}</td>
                      <td>
                        {row.paymentProof ? (
                          <button className="btn-primary" type="button" style={{ padding: '5px 10px', fontSize: '14px' }}>
                            {row.paymentProof}
                          </button>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td style={{
                        color: ['APPROVED', 'COMPLETED'].includes(row.status) ? '#27ae60' : row.status === 'REJECTED' ? '#e74c3c' : '#f39c12',
                        fontWeight: 500
                      }}>
                        {row.status.replace(/_/g, ' ')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          {['WAITING_FOR_RECEIVER_CONFIRMATION', 'PENDING'].includes(row.status) && (
                            <>
                              <button className="action-btn accept-btn" type="button" title="Accept" style={{ background: '#e8f8f5', color: '#27ae60', border: '1px solid #27ae60', padding: '4px 12px', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }} onClick={() => handleUpdateStatus(row.transactionId, 'APPROVED')}>
                                Approve
                              </button>
                              <button className="action-btn reject-btn" type="button" title="Reject" style={{ background: '#fadbd8', color: '#e74c3c', border: '1px solid #e74c3c', padding: '4px 12px', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }} onClick={() => handleUpdateStatus(row.transactionId, 'REJECTED')}>
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-footer" style={{ justifyContent: 'center', marginTop: '12px' }}>
              <div className="pagination">
                <button className="page-btn">&lt;&lt;</button>
                <button className="page-btn">&lt;</button>
                <button className="page-btn active">1</button>
                <button className="page-btn">2</button>
                <button className="page-btn">3</button>
                <button className="page-btn">4</button>
                <button className="page-btn">5</button>
                <button className="page-btn">6</button>
                <button className="page-btn">7</button>
                <button className="page-btn">&gt;</button>
                <button className="page-btn">&gt;&gt;</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DonationReport;

