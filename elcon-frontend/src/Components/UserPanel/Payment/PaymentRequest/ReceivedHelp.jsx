import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getMyDonations, updateDonationStatus } from "../../../../api/donationsService";
import DonationVerificationModal from "../../../shared/DonationVerificationModal/DonationVerificationModal";
import FlashMessage from "../../../shared/FlashMessage/FlashMessage";
import "./ReceivedHelp.css";

const exportColumns = ['S.NO', 'DONAR MID', 'DONAR MEMBER NAME', 'AMOUNT', 'UPGRADE', 'REQUEST DATE', 'TRANSACTION ID', 'UTR NUMBER', 'SKIPPED ID', 'STATUS'];

const ReceivedHelp = () => {
  const [receivedHelpRows, setReceivedHelpRows] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [filters, setFilters] = useState({ donorMemberId: '', rank: '', startDate: '', endDate: '' });
  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [pendingDonationId, setPendingDonationId] = useState(null);

  // Flash message
  const [flash, setFlash] = useState({ message: '', type: 'info' });
  const showFlash = useCallback((message, type = 'info') => setFlash({ message, type }), []);
  const clearFlash = useCallback(() => setFlash({ message: '', type: 'info' }), []);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [filters, activeTab, pageSize]);

  useEffect(() => {
    fetchReceivedDonations();
  }, []);

  const fetchReceivedDonations = async () => {
    try {
      setLoading(true);
      const data = await getMyDonations();
      const receivedDonations = data?.data?.received || [];

      const received = receivedDonations.map((donation, index) => ({
        sNo: index + 1,
        memberId: donation.fromMemberId || 'N/A',
        name: donation.fromName || 'N/A',
        amount: donation.amount || 0,
        rank: donation.level || '-',
        directs: donation.directs || 0,
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
    } catch (err) {
      showFlash('Failed to load received donations', 'error');
      console.error('ReceivedHelp fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open modal when member clicks ACCEPT
  const handleAcceptClick = (donationId) => {
    setPendingDonationId(donationId);
    setModalOpen(true);
  };

  // Member submits modal with UTR + transaction password
  const handleModalSubmit = async ({ utrNumber, transactionPassword, remark }) => {
    if (!pendingDonationId) return;
    try {
      setModalLoading(true);
      await updateDonationStatus(pendingDonationId, 'APPROVED', remark, utrNumber, transactionPassword);
      setModalOpen(false);
      setPendingDonationId(null);
      showFlash('Donation accepted successfully!', 'success');
      await fetchReceivedDonations();
    } catch (err) {
      setModalLoading(false);
      showFlash(err?.response?.data?.message || 'Failed to accept donation', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setPendingDonationId(null);
  };

  // Reject without modal
  const handleReject = async (donationId) => {
    if (!window.confirm('Are you sure you want to REJECT this donation?')) return;
    try {
      setLoading(true);
      await updateDonationStatus(donationId, 'REJECTED');
      showFlash('Donation rejected.', 'warning');
      await fetchReceivedDonations();
    } catch (err) {
      showFlash(err?.response?.data?.message || 'Failed to reject donation', 'error');
      setLoading(false);
    }
  };

  const handleFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const filteredRows = useMemo(() => {
    return receivedHelpRows.filter((row) => {
      const byDonorId = !filters.donorMemberId || String(row.memberId || '').toLowerCase().includes(filters.donorMemberId.toLowerCase());
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

  const totalPages = Math.ceil(filteredRows.length / Number(pageSize)) || 1;
  const visibleRows = filteredRows.slice((page - 1) * Number(pageSize), page * Number(pageSize));

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  const formatRowsForExport = (rows) => rows.map((row) => ([
    row.sNo, row.memberId, row.name, row.amount, row.rank, row.requestDate,
    row.transactionId, row.utrNumber, row.skippedIds, row.status.replace(/_/g, ' ')
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
      {/* Flash notification */}
      <FlashMessage message={flash.message} type={flash.type} onClose={clearFlash} />

      {/* Verification Modal */}
      <DonationVerificationModal
        isOpen={modalOpen}
        title="DONATION RE-VERIFICATION"
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        loading={modalLoading}
      />

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
                <option value="">UPGRADE</option>
                {[1,2,3,4,5,6,7,8,9,10].map(v => <option key={v} value={String(v)}>{v}</option>)}
              </select>
              <label className="filter-field">
                <input className="text-input" type="date" aria-label="Start Date" value={filters.startDate} onChange={handleFilterChange('startDate')} />
              </label>
              <label className="filter-field">
                <input className="text-input" type="date" aria-label="End Date" value={filters.endDate} onChange={handleFilterChange('endDate')} />
              </label>
              <select className="select-input" value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
                <option value="10">10</option>
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
                    <th>DIRECTS</th>
                    <th>LEVEL DEPTH</th>
                    <th>AMOUNT (₹)</th>
                    <th>UPGRADE</th>
                    <th>REQUEST DATE</th>
                    <th>TRASACTION ID</th>
                    <th>UTR NUMBER</th>
                    <th>SKIPPED ID</th>
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
                        <td>{row.directs || 0}</td>
                        <td>{row.rank}</td>
                        <td style={{ color: '#27ae60', fontWeight: 'bold' }}>₹ {row.amount?.toLocaleString('en-IN')}</td>
                        <td>Level {row.rank}</td>
                        <td>{row.requestDate}</td>
                        <td>{row.transactionId}</td>
                        <td>{row.utrNumber}</td>
                        <td style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.skippedIds}</td>
                        <td>
                          {['WAITING_FOR_RECEIVER_CONFIRMATION', 'PENDING'].includes(row.status) ? (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                className="user-mini-btn user-accept"
                                type="button"
                                onClick={() => handleAcceptClick(row.transactionId)}
                              >
                                ACCEPT
                              </button>
                              <button
                                className="user-mini-btn user-reject"
                                type="button"
                                onClick={() => handleReject(row.transactionId)}
                              >
                                REJECT
                              </button>
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
                      <td colSpan="13" style={{ textAlign: 'center', padding: '30px', color: '#888', fontSize: '15px' }}>
                        No donations found for the selected tab or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.95em', color: 'var(--text-muted)', fontWeight: '500', paddingLeft: '8px' }}>
                Total: {filteredRows.length} requests
              </span>
              <div className="pagination">
                <button className="page-btn" onClick={() => handlePageChange(1)} disabled={page === 1}>&lt;&lt;</button>
                <button className="page-btn" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Prev</button>
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  let s = Math.max(1, page - 1);
                  let e = Math.min(totalPages, s + 2);
                  if (e - s < 2) s = Math.max(1, e - 2);
                  if (p < s || p > e) return null;
                  return (
                    <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => handlePageChange(p)}>
                      {p}
                    </button>
                  );
                })}
                <button className="page-btn" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>Next</button>
                <button className="page-btn" onClick={() => handlePageChange(totalPages)} disabled={page === totalPages}>&gt;&gt;</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReceivedHelp;
