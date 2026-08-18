import { useMemo, useState } from 'react';
import './MembersLocation.css';
import { useEffect } from 'react';
import { getMembersLocation } from '../../../../api/membersService';

const exportColumns = [
  'S.No', 'Member ID', 'Name', 'Mobile', 'D.O.B', 'Join Date', 'Adhar No', 'Pan No',
  'Address', 'State', 'District', 'City', 'Pin Code', 'E-mail ID', 'Status'
];

function MembersLocation() {
  const [membersLocationRows, setMembersLocationRows] = useState([]);
  const [filters, setFilters] = useState({
    memberId: '',
    name: '',
    mobile: '',
    state: '',
    city: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState('10');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembersLocation = async () => {
      try {
        const response = await getMembersLocation();
        setMembersLocationRows(response.data || []);
      } catch (error) {
        setMembersLocationRows([]);
      } finally {
        setLoading(false);
      }
    };

    loadMembersLocation();
  }, []);

  const filteredRows = useMemo(() => {
    return membersLocationRows.filter((row) => {
      const filterText = searchText.trim().toLowerCase();
      const inGlobalSearch = !filterText || Object.values(row).some((value) => String(value).toLowerCase().includes(filterText));

      const byMember = !filters.memberId || row.memberId.toLowerCase().includes(filters.memberId.toLowerCase());
      const byName = !filters.name || row.name.toLowerCase().includes(filters.name.toLowerCase());
      const byMobile = !filters.mobile || row.mobile.toLowerCase().includes(filters.mobile.toLowerCase());
      const byState = !filters.state || row.state.toLowerCase().includes(filters.state.toLowerCase());
      const byCity = !filters.city || row.city.toLowerCase().includes(filters.city.toLowerCase());
      const byStatus = !filters.status || row.status === filters.status;
      const joinDateValue = row.joinDateRaw ? new Date(row.joinDateRaw).toISOString().slice(0, 10) : '';
      const byStartDate = !filters.startDate || joinDateValue >= filters.startDate;
      const byEndDate = !filters.endDate || joinDateValue <= filters.endDate;

      return inGlobalSearch && byMember && byName && byMobile && byState && byCity && byStatus && byStartDate && byEndDate;
    });
  }, [filters, searchText]);

  const visibleRows = filteredRows.slice(0, Number(pageSize));

  const handleFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const formatRowsForExport = (rows) => rows.map((row) => ([
    row.srNo,
    row.memberId,
    row.name,
    row.mobile,
    row.dob,
    row.joinDate,
    row.adharNo,
    row.panNo,
    row.address,
    row.state,
    row.district,
    row.city,
    row.pinCode,
    row.emailId,
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
    link.setAttribute('download', 'members-location-list.csv');
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
          <title>Members Location</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            h2 { margin: 0 0 12px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #d6d6d6; padding: 6px; font-size: 16px; text-align: left; }
            th { background: #e8f6fb; }
          </style>
        </head>
        <body>
          <h2>Members Location</h2>
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
      <h1 className="page-title" style={{ fontSize: '42px', marginBottom: '14px' }}>All Members Location</h1>

      <div className="panel" style={{ borderRadius: '28px', padding: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          <input className="text-input" style={{ maxWidth: '120px' }} placeholder="MEMBER ID" value={filters.memberId} onChange={handleFilterChange('memberId')} />
          <input className="text-input" style={{ maxWidth: '140px' }} placeholder="NAME" value={filters.name} onChange={handleFilterChange('name')} />
          <input className="text-input" style={{ maxWidth: '130px' }} placeholder="MOBILE" value={filters.mobile} onChange={handleFilterChange('mobile')} />
          <input className="text-input" style={{ maxWidth: '110px' }} placeholder="STATE" value={filters.state} onChange={handleFilterChange('state')} />
          <input className="text-input" style={{ maxWidth: '90px' }} placeholder="CITY" value={filters.city} onChange={handleFilterChange('city')} />
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
          <button className="btn-primary" type="button" onClick={() => setSearchText((prev) => prev)}>Search</button>
        </div>

        <div className="btn-row" style={{ justifyContent: 'flex-end', marginBottom: '14px' }}>
          <button className="btn-outline" type="button" onClick={handleExportPdf}>Export PDF</button>
          <button className="btn-outline" type="button" onClick={handleExportExcel}>Export Excel</button>
        </div>

        <div className="table-wrap">
          <table className="data-table" style={{ minWidth: '1700px' }}>
            <thead>
              <tr>
                <th>S.NO</th>
                <th>MEMBER ID</th>
                <th>NAME</th>
                <th>MOBILE</th>
                <th>D.O.B</th>
                <th>JOIN DATE</th>
                <th>ADHAR NO</th>
                <th>PAN NO</th>
                <th>ADDRESS</th>
                <th>STATE</th>
                <th>DISTRICT</th>
                <th>CITY</th>
                <th>PIN CODE</th>
                <th>E-MAIL ID</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="15">Loading...</td>
                </tr>
              ) : visibleRows.length > 0 ? visibleRows.map((row) => (
                <tr key={row.srNo}>
                  <td>{row.srNo}</td>
                  <td>{row.memberId}</td>
                  <td>{row.name}</td>
                  <td>{row.mobile}</td>
                  <td>{row.dob}</td>
                  <td>{row.joinDate}</td>
                  <td>{row.adharNo}</td>
                  <td>{row.panNo}</td>
                  <td>{row.address}</td>
                  <td>{row.state}</td>
                  <td>{row.district}</td>
                  <td>{row.city}</td>
                  <td>{row.pinCode}</td>
                  <td>{row.emailId}</td>
                  <td>{row.status}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="15">No members found</td>
                </tr>
              )}
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

export default MembersLocation;

