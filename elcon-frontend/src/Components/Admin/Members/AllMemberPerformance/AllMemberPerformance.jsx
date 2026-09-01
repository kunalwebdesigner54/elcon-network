import { useEffect, useMemo, useState } from 'react';
import './AllMemberPerformance.css';
import { getMemberPerformance } from '../../../../api/membersService';

const exportColumns = [
  'S.NO',
  'MEMBER ID',
  'MEMBER NAME',
  'MOBILE',
  'JOIN DATE',
  'STATUS',
  'LEVEL DEPTH',
  'DIRECTS',
  'RANK',
  'ACTIVE TEAM COUNT',
  'IN-ACTIVE TEAM COUNT',
  'TOTAL TEAM COUNT',
  'LEVEL INCOME',
  'REPURCHASE INCOME',
  'DONATION INCOME',
  'TOTAL INCOME'
];

function AllMemberPerformance() {
  const [memberPerformanceRows, setMemberPerformanceRows] = useState([]);
  const [filters, setFilters] = useState({
    memberId: '',
    memberName: '',
    status: '',
    levelDepth: '',
    unlockLevel: '',
    rank: '',
    startDate: '',
    endDate: '',
  });
  const [pageSize, setPageSize] = useState('10');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPerformanceRows = async () => {
      try {
        const response = await getMemberPerformance();
        setMemberPerformanceRows(response.data || []);
      } catch (error) {
        setMemberPerformanceRows([]);
      } finally {
        setLoading(false);
      }
    };

    loadPerformanceRows();
  }, []);

  const handleFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const filteredRows = useMemo(() => {
    return memberPerformanceRows.filter((row) => {
      const joinDateValue = row.joinDateRaw ? new Date(row.joinDateRaw).toISOString().slice(0, 10) : '';

      const byMemberId = !filters.memberId || row.memberId.toLowerCase().includes(filters.memberId.toLowerCase());
      const byName = !filters.memberName || row.memberName.toLowerCase().includes(filters.memberName.toLowerCase());
      const byStatus = !filters.status || row.status === filters.status;
      const byLevelDepth = !filters.levelDepth || String(row.levelDepth) === filters.levelDepth;
      const rowDirects = String(row.directsCount ?? row.totalTeamCount ?? row.directs ?? row.unlockLevel ?? 0);
      const byUnlockLevel = !filters.unlockLevel || rowDirects === filters.unlockLevel;
      const byRank = !filters.rank || String(row.rank).toLowerCase().includes(filters.rank.toLowerCase());
      const byStartDate = !filters.startDate || joinDateValue >= filters.startDate;
      const byEndDate = !filters.endDate || joinDateValue <= filters.endDate;

      return byMemberId && byName && byStatus && byLevelDepth && byUnlockLevel && byRank && byStartDate && byEndDate;
    });
  }, [filters, memberPerformanceRows]);

  const visibleRows = filteredRows.slice(0, Number(pageSize));

  const formatRowsForExport = (rows) => rows.map((row) => ([
    row.sNo,
    row.memberId,
    row.memberName,
    row.mobile,
    row.joinDate,
    row.status,
    row.levelDepth,
    row.directsCount ?? row.totalTeamCount ?? row.directs ?? row.unlockLevel ?? 0,
    row.rank,
    row.activeTeamCount,
    row.inactiveTeamCount,
    row.totalTeamCount,
    row.levelIncome,
    row.repurchaseIncome,
    row.donationIncome,
    row.totalIncome
  ]));

  const handleExportExcel = () => {
    const csvRows = [exportColumns, ...formatRowsForExport(memberPerformanceRows)]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'all-member-performance.csv');
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const tableRows = formatRowsForExport(memberPerformanceRows)
      .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
      .join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>All Member Performance</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            h2 { margin: 0 0 12px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #d6d6d6; padding: 6px; font-size: 14px; text-align: left; }
            th { background: #e8f6fb; }
          </style>
        </head>
        <body>
          <h2>All Member Performance</h2>
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
      <h1 className="page-title" style={{ fontSize: '42px', marginBottom: '14px' }}>All-Member-Performance</h1>

      <div className="panel" style={{ borderRadius: '28px', padding: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          <input className="text-input" style={{ maxWidth: '120px' }} placeholder="MEMBER ID" value={filters.memberId} onChange={handleFilterChange('memberId')} />
          <input className="text-input" style={{ maxWidth: '140px' }} placeholder="MEMBER NAME" value={filters.memberName} onChange={handleFilterChange('memberName')} />
          <select className="select-input" style={{ maxWidth: '98px' }} value={filters.status} onChange={handleFilterChange('status')}>
            <option value="">STATUS</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="IN-ACTIVE">IN-ACTIVE</option>
          </select>
          <select className="select-input" style={{ maxWidth: '110px' }} value={filters.levelDepth} onChange={handleFilterChange('levelDepth')}>
            <option value="">LEVEL DEPTH</option>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
          </select>
          <select className="select-input" style={{ maxWidth: '110px' }} value={filters.unlockLevel} onChange={handleFilterChange('unlockLevel')}>
            <option value="">DIRECTS</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="4">4</option>
          </select>
          <input className="text-input" style={{ maxWidth: '90px' }} placeholder="RANK" value={filters.rank} onChange={handleFilterChange('rank')} />
          <input className="text-input" style={{ maxWidth: '120px' }} placeholder="START DATE" type="date" value={filters.startDate} onChange={handleFilterChange('startDate')} />
          <input className="text-input" style={{ maxWidth: '110px' }} placeholder="END DATE" type="date" value={filters.endDate} onChange={handleFilterChange('endDate')} />
          <select className="select-input" style={{ maxWidth: '84px' }} value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="btn-primary" type="button">Search</button>
        </div>

        <div className="btn-row" style={{ justifyContent: 'flex-end', marginBottom: '14px' }}>
          <button type="button" className="btn-outline" onClick={handleExportPdf}>Export PDF</button>
          <button type="button" className="btn-outline" onClick={handleExportExcel}>Export Excel</button>
        </div>

        <div className="table-wrap">
          <table className="data-table" style={{ minWidth: '1650px' }}>
            <thead>
              <tr>
                <th>S.NO</th>
                <th>MEMBER ID</th>
                <th>MEMBER NAME</th>
                <th>MOBILE</th>
                <th>JOIN DATE</th>
                <th>STATUS</th>
                <th>LEVEL DEPTH</th>
                <th>DIRECTS</th>
                <th>RANK</th>
                <th>ACTIVE TEAM COUNT</th>
                <th>IN-ACTIVE TEAM COUNT</th>
                <th>TOTAL TEAM COUNT</th>
                <th>LEVEL INCOME</th>
                <th>REPURCHASE INCOME</th>
                <th>DONATION INCOME</th>
                <th>TOTAL INCOME</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="16">Loading...</td>
                </tr>
              ) : visibleRows.length > 0 ? visibleRows.map((row) => (
                <tr key={row.sNo}>
                  <td>{row.sNo}</td>
                  <td>{row.memberId}</td>
                  <td>{row.memberName}</td>
                  <td>{row.mobile}</td>
                  <td>{row.joinDate}</td>
                  <td className={row.status === 'IN-ACTIVE' ? 'member-performance-status-inactive' : ''}>{row.status}</td>
                  <td>{row.levelDepth}</td>
                  <td>{row.directsCount ?? row.totalTeamCount ?? row.directs ?? row.unlockLevel ?? 0}</td>
                  <td>{row.rank}</td>
                  <td>{row.activeTeamCount}</td>
                  <td>{row.inactiveTeamCount}</td>
                  <td>{row.totalTeamCount}</td>
                  <td>{row.levelIncome}</td>
                  <td>{row.repurchaseIncome}</td>
                  <td>{row.donationIncome}</td>
                  <td>{row.totalIncome}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="16">No member performance found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer" style={{ justifyContent: 'center', marginTop: '12px' }}>
          <div className="pagination">
            <button className="page-btn">&laquo;</button>
            <button className="page-btn">&lsaquo;</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">4</button>
            <button className="page-btn">5</button>
            <button className="page-btn">6</button>
            <button className="page-btn">7</button>
            <button className="page-btn">&rsaquo;</button>
            <button className="page-btn">&raquo;</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllMemberPerformance;

