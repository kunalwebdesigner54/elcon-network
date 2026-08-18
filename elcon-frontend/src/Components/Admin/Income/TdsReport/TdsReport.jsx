import { useMemo, useState } from 'react';
import './TdsReport.css';
import { useEffect } from 'react';
import { getMemberPerformance } from '../../../../api/membersService';
import { getMembersLocation } from '../../../../api/membersService';

function TdsReport() {
  const [filters, setFilters] = useState({ memberId: '', panNo: '', startDate: '', endDate: '' });
  const [pageSize, setPageSize] = useState('10');
  const [memberRows, setMemberRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getMembersLocation(), getMemberPerformance()])
      .then(([locationResponse, performanceResponse]) => {
        const locationMap = new Map((locationResponse.data || []).map((row) => [String(row.memberId || '').toLowerCase(), row]));
        const performanceRows = Array.isArray(performanceResponse.data) ? performanceResponse.data : [];

        setMemberRows(performanceRows.map((row, index) => {
          const location = locationMap.get(String(row.memberId || '').toLowerCase()) || {};
          return {
            sno: index + 1,
            memberId: row.memberId,
            memberName: row.memberName,
            mobileNo: location.mobile || row.mobile || '---',
            email: location.emailId || '---',
            panNo: location.panNo || '---',
            totalTds: (Number(row.totalIncome || 0) * 0.05).toFixed(2),
          };
        }));
      })
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load TDS report.'))
      .finally(() => setLoading(false));
  }, []);

  const tdsRows = useMemo(() => {
    const memberId = filters.memberId.toLowerCase();
    const panNo = filters.panNo.toLowerCase();

    return memberRows
      .filter((row) => {
        return (
          (!memberId || row.memberId.toLowerCase().includes(memberId)) &&
          (!panNo || row.panNo.toLowerCase().includes(panNo))
        );
      })
      .slice(0, Number(pageSize));
  }, [filters, memberRows, pageSize]);

  const onFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  return (
    <div className="tds-report-report-page">
      <h2 className="tds-report-screen-title">TDS Report</h2>

      <section className="panel tds-report-panel">
        <div className="tds-report-filter-row">
          <input type="text" className="text-input tds-report-filter-input" placeholder="MEMBER ID" value={filters.memberId} onChange={onFilterChange('memberId')} />
          <input type="text" className="text-input tds-report-filter-input" placeholder="PAN NO" value={filters.panNo} onChange={onFilterChange('panNo')} />
          <input type="date" className="text-input tds-report-filter-input" value={filters.startDate} onChange={onFilterChange('startDate')} />
          <input type="date" className="text-input tds-report-filter-input" value={filters.endDate} onChange={onFilterChange('endDate')} />
          <select className="select-input tds-report-filter-input tds-report-size-select" value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <button type="button" className="btn-primary tds-report-search-btn">Search</button>
        </div>

        <div className="tds-report-export-row">
          <button type="button" className="btn-outline tds-report-export-btn">XLS</button>
          <button type="button" className="btn-outline tds-report-export-btn">PDF</button>
        </div>

        <div className="table-wrap tds-report-table-wrap">
          <table className="data-table tds-report-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>MEMBER ID</th>
                <th>Member Name</th>
                <th>Mobile No</th>
                <th>E-mail ID.</th>
                <th>PAN NO</th>
                <th>Total TDS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={7}>{error}</td></tr>
              ) : tdsRows.length === 0 ? (
                <tr><td colSpan={7}>No TDS records found.</td></tr>
              ) : tdsRows.map((row) => (
                <tr key={`${row.sno}-${row.memberId}`}>
                  <td>{row.sno}</td>
                  <td>{row.memberId}</td>
                  <td>{row.memberName}</td>
                  <td>{row.mobileNo}</td>
                  <td>{row.email}</td>
                  <td>{row.panNo}</td>
                  <td>{row.totalTds}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="tds-report-table-footer">
          <div className="tds-report-pagination">
            <button type="button" className="tds-report-page-btn">&laquo;</button>
            <button type="button" className="tds-report-page-btn">&lsaquo;</button>
            <button type="button" className="tds-report-page-btn tds-report-active">1</button>
            <button type="button" className="tds-report-page-btn">2</button>
            <button type="button" className="tds-report-page-btn">3</button>
            <button type="button" className="tds-report-page-btn">4</button>
            <button type="button" className="tds-report-page-btn">5</button>
            <button type="button" className="tds-report-page-btn">6</button>
            <button type="button" className="tds-report-page-btn">7</button>
            <button type="button" className="tds-report-page-btn">&rsaquo;</button>
            <button type="button" className="tds-report-page-btn">&raquo;</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TdsReport;