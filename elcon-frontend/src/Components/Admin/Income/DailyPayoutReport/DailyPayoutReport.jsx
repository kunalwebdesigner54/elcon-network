import './DailyPayoutReport.css';
import { useEffect, useMemo, useState } from 'react';
import { getDailyPayoutReport } from '../../../../api/membersService';

function DailyPayoutReport() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [filterMemberId, setFilterMemberId] = useState('');
  const [filterMemberName, setFilterMemberName] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    memberId: '',
    memberName: '',
    startDate: '',
    endDate: ''
  });

  const [pageSize, setPageSize] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getDailyPayoutReport()
      .then((response) => setRows(Array.isArray(response.data) ? response.data : []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load daily payout report.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    setAppliedFilters({
      memberId: filterMemberId.trim(),
      memberName: filterMemberName.trim(),
      startDate: filterStartDate,
      endDate: filterEndDate
    });
    setCurrentPage(1);
  };

  const adminDailyPayoutData = useMemo(() => {
    let filteredRows = rows;

    if (appliedFilters.memberId) {
      filteredRows = filteredRows.filter(r =>
        r.memberId?.toLowerCase().includes(appliedFilters.memberId.toLowerCase())
      );
    }

    if (appliedFilters.memberName) {
      filteredRows = filteredRows.filter(r =>
        r.memberName?.toLowerCase().includes(appliedFilters.memberName.toLowerCase())
      );
    }

    if (appliedFilters.startDate) {
      filteredRows = filteredRows.filter(r => {
        const rowDateKey = r.dateKey || (r.incomeDate ? r.incomeDate.split('-').reverse().join('-') : '');
        return rowDateKey && rowDateKey >= appliedFilters.startDate;
      });
    }

    if (appliedFilters.endDate) {
      filteredRows = filteredRows.filter(r => {
        const rowDateKey = r.dateKey || (r.incomeDate ? r.incomeDate.split('-').reverse().join('-') : '');
        return rowDateKey && rowDateKey <= appliedFilters.endDate;
      });
    }

    return filteredRows.map((row, index) => {
      const levelIncome = Number(row.levelIncome || 0);
      const repurchaseIncome = Number(row.repurchaseIncome || 0);
      const grossIncome = Number(row.grossIncome !== undefined ? row.grossIncome : (levelIncome + repurchaseIncome));
      const tds = Number(row.tds !== undefined ? row.tds : (grossIncome * 0.05));
      const adminCharge = Number(row.adminCharge !== undefined ? row.adminCharge : (grossIncome * 0.05));
      const netPayable = Number(row.netPayable !== undefined ? row.netPayable : (grossIncome - tds - adminCharge));

      return {
        sNo: index + 1,
        incomeDate: row.incomeDate,
        dateKey: row.dateKey,
        memberId: row.memberId,
        memberName: row.memberName,
        levelIncome,
        repurchaseIncome,
        grossIncome,
        tds,
        adminCharge,
        netPayable,
        status: row.status || 'Credited To E-wallet',
      };
    });
  }, [rows, appliedFilters]);

  const indexOfLastItem = currentPage * Number(pageSize);
  const indexOfFirstItem = indexOfLastItem - Number(pageSize);
  const visibleRows = adminDailyPayoutData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(adminDailyPayoutData.length / Number(pageSize)));

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPayoutAmount = visibleRows.reduce((sum, row) => sum + Number(row.netPayable || 0), 0);

  const exportColumns = [
    'S.NO',
    'INCOME DATE',
    'MEMBER ID',
    'MEMBER NAME',
    'LEVEL INCOME',
    'REPURCHASE INCOME',
    'GROSS INCOME',
    'TDS - 5%',
    'ADMIN CHARGE - 5%',
    'NET PAYABLE',
    'STATUS',
  ];

  const formatRowsForExport = (dataRows) => dataRows.map((row) => [
    row.sNo,
    row.incomeDate,
    row.memberId,
    row.memberName,
    row.levelIncome.toFixed(2),
    row.repurchaseIncome.toFixed(2),
    row.grossIncome.toFixed(2),
    row.tds.toFixed(2),
    row.adminCharge.toFixed(2),
    row.netPayable.toFixed(2),
    row.status,
  ]);

  const handleExportExcel = () => {
    if (!adminDailyPayoutData || adminDailyPayoutData.length === 0) return;
    const csvRows = [exportColumns, ...formatRowsForExport(adminDailyPayoutData)]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'daily-payout-report.csv');
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (!adminDailyPayoutData || adminDailyPayoutData.length === 0) return;
    const tableRows = formatRowsForExport(adminDailyPayoutData)
      .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
      .join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Daily Payout Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; color: #333; }
            h2 { margin: 0 0 12px 0; color: #111; }
            p { font-size: 13px; color: #666; margin: 0 0 12px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #d6d6d6; padding: 8px 6px; font-size: 13px; text-align: left; }
            th { background: #f0f4f8; font-weight: bold; }
            tr:nth-child(even) { background-color: #fafafa; }
            .total-row { font-weight: bold; background: #e8f4f8; }
          </style>
        </head>
        <body>
          <h2>Daily Payout Report</h2>
          <p>Total Entries: ${adminDailyPayoutData.length} | Generated on: ${new Date().toLocaleString('en-IN')}</p>
          <table>
            <thead>
              <tr>${exportColumns.map((col) => `<th>${col}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr class="total-row">
                <td colspan="9" style="text-align: right;">TOTAL PAYOUT AMOUNT</td>
                <td colspan="2">${adminDailyPayoutData.reduce((sum, r) => sum + r.netPayable, 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="daily-payout-report-report-page">
      <h2 className="daily-payout-report-screen-title">Daily Payout Report</h2>

      <section className="panel daily-payout-report-panel">
        <div className="daily-payout-report-filter-row">
          <input
            className="text-input daily-payout-report-filter-input"
            placeholder="MEMBER ID"
            value={filterMemberId}
            onChange={(e) => setFilterMemberId(e.target.value)}
          />
          <input
            className="text-input daily-payout-report-filter-input"
            placeholder="MEMBER NAME"
            value={filterMemberName}
            onChange={(e) => setFilterMemberName(e.target.value)}
          />
          <input
            className="text-input daily-payout-report-filter-input"
            type="date"
            placeholder="START DATE"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
          />
          <input
            className="text-input daily-payout-report-filter-input"
            type="date"
            placeholder="END DATE"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
          />
          <select
            className="select-input daily-payout-report-filter-input daily-payout-report-size-select"
            value={pageSize}
            onChange={(e) => { setPageSize(e.target.value); setCurrentPage(1); }}
          >
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="btn-primary daily-payout-report-search-btn" type="button" onClick={handleSearch}>SEARCH</button>
        </div>

        <div className="daily-payout-report-export-row">
          <button type="button" className="btn-outline daily-payout-report-export-btn" onClick={handleExportExcel}>XLS</button>
          <button type="button" className="btn-outline daily-payout-report-export-btn" onClick={handleExportPdf}>PDF</button>
        </div>

        <div className="table-wrap daily-payout-report-table-wrap">
          <table className="data-table daily-payout-report-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>INCOME DATE</th>
                <th>MEMBER ID</th>
                <th>MEMBER NAME</th>
                <th>LEVEL INCOME</th>
                <th>REPURCHASE INCOME</th>
                <th>GROSS INCOME</th>
                <th>TDS - 5%</th>
                <th>ADMIN CHARGE - 5%</th>
                <th>NET PAYABLE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} style={{textAlign: 'center'}}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={11} style={{textAlign: 'center', color: 'red'}}>{error}</td></tr>
              ) : adminDailyPayoutData.length === 0 ? (
                <tr><td colSpan={11} style={{textAlign: 'center'}}>No payout data found.</td></tr>
              ) : (
                <>
                  {visibleRows.map((row) => (
                    <tr key={row.sNo}>
                      <td>{row.sNo}</td>
                      <td>{row.incomeDate}</td>
                      <td>{row.memberId}</td>
                      <td>{row.memberName}</td>
                      <td>{row.levelIncome.toFixed(2)}</td>
                      <td>{row.repurchaseIncome.toFixed(2)}</td>
                      <td>{row.grossIncome.toFixed(2)}</td>
                      <td>{row.tds.toFixed(2)}</td>
                      <td>{row.adminCharge.toFixed(2)}</td>
                      <td>{row.netPayable.toFixed(2)}</td>
                      <td>{row.status}</td>
                    </tr>
                  ))}
                  <tr className="daily-payout-report-summary-row">
                    <td colSpan="9" style={{ textAlign: 'right', fontWeight: 700 }}>PAGE TOTAL PAYOUT AMOUNT</td>
                    <td colSpan="2" style={{ fontWeight: 700 }}>{totalPayoutAmount.toFixed(2)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="daily-payout-report-table-footer" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', gap: '15px', background: 'rgba(0, 229, 255, 0.05)', padding: '16px', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: '12px' }}>
          <div style={{ fontWeight: '700', color: '#00e5ff', fontSize: '16px', letterSpacing: '0.5px' }}>
            <i className="fa-solid fa-chart-pie" style={{ marginRight: '8px' }}></i>
            Total Entries : {adminDailyPayoutData.length}
          </div>
          <div className="daily-payout-report-pagination" style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            <button className="daily-payout-report-page-btn" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>«</button>
            <button className="daily-payout-report-page-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>‹</button>
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              if (
                totalPages <= 7 ||
                pageNum === 1 ||
                pageNum === totalPages ||
                Math.abs(currentPage - pageNum) <= 1
              ) {
                return (
                  <button
                    key={pageNum}
                    className={`daily-payout-report-page-btn ${currentPage === pageNum ? 'daily-payout-report-active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                (pageNum === 2 && currentPage > 3) ||
                (pageNum === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return <span key={pageNum} style={{color: '#00e5ff', padding: '0 5px'}}>...</span>;
              }
              return null;
            })}
            <button className="daily-payout-report-page-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
            <button className="daily-payout-report-page-btn" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>»</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DailyPayoutReport;
