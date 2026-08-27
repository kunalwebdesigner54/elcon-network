import React, { useState, useEffect, useMemo } from "react";
import { getMyDonations, updateDonationStatus } from "../../../../api/donationsService";
import "./ReceivedHelp.css";

const exportColumns = ['S.NO', 'DONAR MID', 'DONAR MEMBER NAME', 'AMOUNT', 'UPGRADE LEVEL', 'REQUEST DATE', 'TRANSACTION ID', 'UTR NUMBER', 'SKIPPED IDs', 'STATUS'];

const ReceivedHelp = () => {
  const [receivedHelpRows, setReceivedHelpRows] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [filters, setFilters] = useState({ donorMemberId: '', rank: '', startDate: '', endDate: '' });
  const [pageSize, setPageSize] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReceivedDonations();
  }, []);

  const fetchReceivedDonations = async () => {
    try {
      setLoading(true);
      const data = await getMyDonations();
      // Backend returns: { success, data: { sent: [...], received: [...], summary: {...} } }
      const receivedDonations = data?.data?.received || [];

      const received = receivedDonations.map((donation, index) => ({
        sNo: index + 1,
        memberId: donation.fromMemberId || 'N/A',
        name: donation.fromName || 'N/A',
        amount: donation.amount || 0,
        rank: donation.level || '-',
        requestDate: donation.dateRaw ? new Date(donation.dateRaw).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : (donation.date || '-'),
        dateRaw: donation.dateRaw,
        transactionId: donation.donationId || '-',
        utrNumber: donation.utrNumber || '---',
        skippedIds: donation.skippedMembers && donation.skippedMembers.length > 0 
          ? donation.skippedMembers.map(s => s.memberId || s).join(', ') 
          : '---',
        status: donation.status || 'PENDING'
      }));

      setReceivedHelpRows(received);
      setError('');
    } catch (err) {
      setError('Failed to load received donations');
      console.error('ReceivedHelp fetch error:', err);
      setReceivedHelpRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (donationId, status) => {
    if (!window.confirm(`Are you sure you want to mark this donation as ${status}?`)) return;
    try {
      setLoading(true);
      await updateDonationStatus(donationId, status);
      await fetchReceivedDonations();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update status');
      setLoading(false);
    }
  };

  const handleFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const filteredRows = useMemo(() => {
    return receivedHelpRows.filter((row) => {
      const byDonorId = !filters.donorMemberId || row.memberId.toLowerCase().includes(filters.donorMemberId.toLowerCase());
      const byRank = !filters.rank || String(row.rank) === filters.rank;
      const byStatus = activeTab === 'ALL' || row.status === activeTab;

      let byStartDate = true;
      let byEndDate = true;
      if (row.dateRaw && (filters.startDate || filters.endDate)) {
        const rowDate = new Date(row.dateRaw);
        if (filters.startDate) {
          const start = new Date(filters.startDate);
          start.setHours(0, 0, 0, 0);
          byStartDate = rowDate >= start;
        }
        if (filters.endDate) {
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          byEndDate = rowDate <= end;
        }
      }

      return byDonorId && byRank && byStatus && byStartDate && byEndDate;
    });
  }, [filters, receivedHelpRows, activeTab]);

  const visibleRows = filteredRows.slice(0, Number(pageSize));

  const formatRowsForExport = (rows) => rows.map((row) => ([
    row.sNo, row.memberId, row.name, row.amount, row.rank, row.requestDate, row.transactionId, row.utrNumber, row.skippedIds, row.status.replace(/_/g, ' ')
  ]));

  const handleExportExcel = () => {
    const csvRows = [exportColumns, ...formatRowsForExport(filteredRows)]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'received-help.csv');
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const tableRows = formatRowsForExport(filteredRows)
      .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
      .join('');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Received Help</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            h2 { margin: 0 0 12px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #d6d6d6; padding: 6px; font-size: 14px; text-align: left; }
            th { background: #e8f6fb; }
          </style>
        </head>
        <body>
          <h2>Received Help (Downline ➔ You)</h2>
          <table>
            <thead><tr>${exportColumns.map((c) => `<th>${c}</th>`).join('')}</tr></thead>
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
      <h1 className="user-page-title">Received Help (Downline ➔ You)</h1>
      <div className="donation-tabs">
        {[
          { key: 'WAITING_FOR_RECEIVER_CONFIRMATION', label: 'WAITING' },
          { key: 'APPROVED', label: 'APPROVED' },
          { key: 'PENDING', label: 'PENDING' },
          { key: 'REJECTED', label: 'REJECTED' },
          { key: 'ALL', label: 'ALL HISTORY' }
        ].map(tab => (
          <button 
            key={tab.key}
            className={`donation-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="user-panel">
        {error && <div style={{ color: '#e74c3c', marginBottom: '14px' }}>{error}</div>}
        {loading && <div style={{ color: '#666', marginBottom: '14px' }}>Loading...</div>}
        
        {!loading && (
          <>
            <div
              className="level-income-filters"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, minmax(110px, 1fr))",
                gap: 8,
                marginBottom: 14,
                ...(window.innerWidth <= 600 ? { gridTemplateColumns: "1fr", gap: 6 } : {})
              }}
            >
              <input className="text-input" placeholder="DONAR MID" value={filters.donorMemberId} onChange={handleFilterChange('donorMemberId')} />
              <select className="select-input" value={filters.rank} onChange={handleFilterChange('rank')}>
                <option value="">UPGRADE LEVEL</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
              <label className="filter-field">
                <input className="text-input" type="date" aria-label="Start Date" value={filters.startDate} onChange={handleFilterChange('startDate')} />
              </label>
              <label className="filter-field">
                <input className="text-input" type="date" aria-label="End Date" value={filters.endDate} onChange={handleFilterChange('endDate')} />
              </label>
              <select className="select-input" value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <button className="user-btn-blue3" type="button" style={{ height: '100%', minHeight: '40px', padding: '0' }} onClick={() => {}}>Search</button>
            </div>
            <div className="epin-tools" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 10 }}>
              <button className="btn-outline" onClick={handleExportExcel}>Excel</button>
              <button className="btn-outline" onClick={handleExportPdf}>PDF</button>
              <button className="btn-outline" onClick={handleExportPdf}>Print</button>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>S.NO</th>
                    <th>DONAR MID</th>
                    <th>DONAR MEMBER NAME</th>
                    <th>AMOUNT</th>
                    <th>UPGRADE LEVEL</th>
                    <th>REQUEST DATE</th>
                    <th>TRASACTION ID</th>
                    <th>UTR NUMBER</th>
                    <th>SKIPPED IDs</th>
                    <th>ACTION</th>
                    <th>STATUS</th>
              </tr>
            </thead>
                <tbody>
                  {visibleRows.length > 0 ? (
                    visibleRows.map((row) => (
                    <tr key={row.sNo}>
                      <td>{row.sNo}</td>
                      <td>{row.memberId}</td>
                      <td>{row.name}</td>
                      <td>{row.amount}</td>
                      <td>{row.rank}</td>
                      <td>{row.requestDate}</td>
                      <td>{row.transactionId}</td>
                      <td>{row.utrNumber}</td>
                      <td style={{ maxWidth: '150px', wordWrap: 'break-word' }}>{row.skippedIds}</td>
                      <td>
                        {['WAITING_FOR_RECEIVER_CONFIRMATION', 'PENDING'].includes(row.status) ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="user-mini-btn user-accept" type="button" onClick={() => handleUpdateStatus(row.transactionId, 'APPROVED')}>ACCEPT</button>
                            <button className="user-mini-btn user-reject" type="button" onClick={() => handleUpdateStatus(row.transactionId, 'REJECTED')}>REJECT</button>
                          </div>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td style={{
                        color: ['APPROVED', 'COMPLETED'].includes(row.status) ? '#27ae60' : row.status === 'REJECTED' ? '#e74c3c' : '#f39c12',
                        fontWeight: 500
                      }}>
                        {row.status.replace(/_/g, ' ')}
                      </td>
                    </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#888', fontSize: '15px' }}>
                        No donations found for the selected tab or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
          </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReceivedHelp;
