import { useMemo, useState } from 'react';
import './MemberView.css';

const allMembersRows = [
  {
    srNo: '1', sponsorId: 'MM101010', memberId: 'MM101011', name: 'AMBIKA SALUNKE', mobile: '+91 7020110118',
    joiningDateTime: '05-02-2026 12:57:37PM', jLevel: '21', state: 'BIHAR', city: 'PUNE', status: 'ACTIVE', password: '123456', trasPassword: 'ABC@123', wallet: '0.00'
  },
  {
    srNo: '2', sponsorId: 'MM101011', memberId: 'MM101012', name: 'AMBIKA SALUNKE', mobile: '+91 7020110118',
    joiningDateTime: '05-02-2026 12:57:37PM', jLevel: '9', state: 'BIHAR', city: 'PCMC', status: 'ACTIVE', password: '123456', trasPassword: '123456', wallet: '0.00'
  },
  {
    srNo: '3', sponsorId: 'MM101012', memberId: 'MM101013', name: 'AMBIKA SALUNKE', mobile: '+91 7020110118',
    joiningDateTime: '05-02-2026 12:57:37PM', jLevel: '2', state: 'BIHAR', city: 'PUNE', status: 'IN-ACTIVE', password: '123456', trasPassword: '123456', wallet: '0.00'
  },
  {
    srNo: '4', sponsorId: 'MM101013', memberId: 'MM101014', name: 'AMBIKA SALUNKE', mobile: '+91 7020110118',
    joiningDateTime: '05-02-2026 12:57:37PM', jLevel: '1', state: 'BIHAR', city: 'PATANA', status: 'ACTIVE', password: 'ABCDEF', trasPassword: 'ABCDEF', wallet: '0.00'
  },
  {
    srNo: '5', sponsorId: 'MM101014', memberId: 'MM101015', name: 'AMBIKA SALUNKE', mobile: '+91 7020110118',
    joiningDateTime: '05-02-2026 12:57:37PM', jLevel: '1', state: 'BIHAR', city: 'THANE', status: 'IN-ACTIVE', password: '123456', trasPassword: '123456', wallet: '0.00'
  },
  {
    srNo: '6', sponsorId: 'MM101015', memberId: 'MM101016', name: 'AMBIKA SALUNKE', mobile: '+91 7020110118',
    joiningDateTime: '05-02-2026 12:57:37PM', jLevel: '2', state: 'BIHAR', city: 'NAGAR', status: 'ACTIVE', password: '123456', trasPassword: '123456', wallet: '0.00'
  },
  {
    srNo: '7', sponsorId: 'MM101016', memberId: 'MM101017', name: 'AMBIKA SALUNKE', mobile: '+91 7020110118',
    joiningDateTime: '05-02-2026 12:57:37PM', jLevel: '1', state: 'BIHAR', city: 'SATARA', status: 'ACTIVE', password: '123456', trasPassword: '123456', wallet: '0.00'
  }
];

const actionBtnStyle = {
  border: 0,
  borderRadius: '4px',
  minWidth: '62px',
  height: '24px',
  fontSize: "16px",
  cursor: 'pointer',
  color: '#fff',
  fontWeight: 700,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 8px'
};

const exportColumns = [
  'S.No', 'Sponsor ID', 'Member ID', 'Name', 'Mobile', 'Joining Date & Time',
  'J.Level', 'State', 'City', 'Status', 'Password', 'TRAS Password', 'Wallet'
];

function MemberView() {
  const [filters, setFilters] = useState({
    sponsorId: '',
    memberId: '',
    name: '',
    mobile: '',
    city: '',
    level: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [searchText] = useState('');
  const [pageSize, setPageSize] = useState('10');

  const filteredRows = useMemo(() => {
    return allMembersRows.filter((row) => {
      const filterText = searchText.trim().toLowerCase();
      const inGlobalSearch = !filterText || Object.values(row).some((value) => String(value).toLowerCase().includes(filterText));

      const bySponsor = !filters.sponsorId || row.sponsorId.toLowerCase().includes(filters.sponsorId.toLowerCase());
      const byMember = !filters.memberId || row.memberId.toLowerCase().includes(filters.memberId.toLowerCase());
      const byName = !filters.name || row.name.toLowerCase().includes(filters.name.toLowerCase());
      const byMobile = !filters.mobile || row.mobile.toLowerCase().includes(filters.mobile.toLowerCase());
      const byCity = !filters.city || row.city.toLowerCase().includes(filters.city.toLowerCase());
      const byLevel = !filters.level || row.jLevel === filters.level;
      const byStatus = !filters.status || row.status === filters.status;
      const byStartDate = !filters.startDate || row.joiningDateTime >= filters.startDate;
      const byEndDate = !filters.endDate || row.joiningDateTime <= filters.endDate;

      return inGlobalSearch && bySponsor && byMember && byName && byMobile && byCity && byLevel && byStatus && byStartDate && byEndDate;
    });
  }, [filters, searchText]);

  const visibleRows = filteredRows.slice(0, Number(pageSize));

  const handleFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const formatRowsForExport = (rows) => rows.map((row) => ([
    row.srNo,
    row.sponsorId,
    row.memberId,
    row.name,
    row.mobile,
    row.joiningDateTime,
    row.jLevel,
    row.state,
    row.city,
    row.status,
    row.password,
    row.trasPassword,
    row.wallet
  ]));

  const handleExportExcel = () => {
    const csvRows = [exportColumns, ...formatRowsForExport(filteredRows)]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'all-members-list.csv');
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
          <title>All Members List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            h2 { margin: 0 0 12px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #d6d6d6; padding: 6px; font-size: 16px; text-align: left; }
            th { background: #e8f6fb; }
          </style>
        </head>
        <body>
          <h2>All Members List</h2>
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
      <h1 className="page-title" style={{ fontSize: '42px', marginBottom: '14px' }}>All Members List</h1>

      <div className="panel" style={{ borderRadius: '28px', padding: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          <input className="text-input" style={{ maxWidth: '120px' }} placeholder="SPONSOR ID" value={filters.sponsorId} onChange={handleFilterChange('sponsorId')} />
          <input className="text-input" style={{ maxWidth: '120px' }} placeholder="MEMBER ID" value={filters.memberId} onChange={handleFilterChange('memberId')} />
          <input className="text-input" style={{ maxWidth: '140px' }} placeholder="NAME" value={filters.name} onChange={handleFilterChange('name')} />
          <input className="text-input" style={{ maxWidth: '130px' }} placeholder="MOBILE" value={filters.mobile} onChange={handleFilterChange('mobile')} />
          <input className="text-input" style={{ maxWidth: '90px' }} placeholder="CITY" value={filters.city} onChange={handleFilterChange('city')} />
          <select className="select-input" style={{ maxWidth: '90px' }} value={filters.level} onChange={handleFilterChange('level')}>
            <option value="">LEVEL</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="9">9</option>
            <option value="21">21</option>
          </select>
          <select className="select-input" style={{ maxWidth: '98px' }} value={filters.status} onChange={handleFilterChange('status')}>
            <option value="">STATUS</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="IN-ACTIVE">IN-ACTIVE</option>
          </select>
          <input className="text-input" style={{ maxWidth: '120px' }} placeholder="START DATE" value={filters.startDate} onChange={handleFilterChange('startDate')} />
          <input className="text-input" style={{ maxWidth: '110px' }} placeholder="END DATE" value={filters.endDate} onChange={handleFilterChange('endDate')} />
          <select className="select-input" style={{ maxWidth: '84px' }} value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
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
          <table className="data-table" style={{ minWidth: '1420px' }}>
            <thead>
              <tr>
                <th>S.no</th>
                <th>SPONSOR ID</th>
                <th>MEMBER ID</th>
                <th>NAME</th>
                <th>MOBILE</th>
                <th>JOINING DATE &amp; TIME</th>
                <th>J.LEVEL</th>
                <th>STATE</th>
                <th>CITY</th>
                <th>STATUS</th>
                <th>PASSWORD</th>
                <th>TRAS PASSWORD</th>
                <th>WALLET</th>
                <th>ACTION</th>
                <th>LOGIN</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.srNo}>
                  <td>{row.srNo}</td>
                  <td>{row.sponsorId}</td>
                  <td>{row.memberId}</td>
                  <td>{row.name}</td>
                  <td>{row.mobile}</td>
                  <td>{row.joiningDateTime}</td>
                  <td>{row.jLevel}</td>
                  <td>{row.state}</td>
                  <td>{row.city}</td>
                  <td>{row.status}</td>
                  <td>{row.password}</td>
                  <td>{row.trasPassword}</td>
                  <td>{row.wallet}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button type="button" style={{ ...actionBtnStyle, backgroundColor: '#5fc9de' }} title="Edit Profile">Edit</button>
                      <button type="button" style={{ ...actionBtnStyle, backgroundColor: '#4fc79f' }} title="Active/Inactive">Status</button>
                      <button type="button" style={{ ...actionBtnStyle, backgroundColor: '#49b9d8' }} title="Credit/Debit Wallet">Wallet</button>
                    </div>
                  </td>
                  <td>
                    <button className="btn-primary" type="button" style={{ padding: '5px 12px', fontSize: "16px" }}>
                      Login
                    </button>
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

      </div>
    </div>
  );
}

export default MemberView;

