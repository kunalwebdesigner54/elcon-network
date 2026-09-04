import { useMemo, useState } from 'react';
import './TdsReport.css';
import { useEffect } from 'react';
import { getMemberPerformance } from '../../../../api/membersService';
import { getMembersLocation } from '../../../../api/membersService';

function TdsReport() {
  const [filters, setFilters] = useState({ memberId: '', panNo: '', startDate: '', endDate: '' });
  const [pageSize, setPageSize] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);
  const [memberRows, setMemberRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getMemberPerformance()])
      .then(([performanceResponse]) => {
        const performanceRows = Array.isArray(performanceResponse.data) ? performanceResponse.data : [];

        setMemberRows(performanceRows.map((row, index) => {
          return {
            sno: index + 1,
            memberId: row.memberId,
            memberName: row.memberName,
            mobileNo: row.mobile || '---',
            email: '---',
            panNo: row.panNo || '---',
            totalTds: (Number(row.totalIncome || 0) * 0.05).toFixed(2),
          };
        }));
      })
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load TDS report.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    const memberId = (filters.memberId || '').toLowerCase();
    const panNo = (filters.panNo || '').toLowerCase();

    return memberRows.filter((row) => {
      return (
        (!memberId || String(row.memberId || '').toLowerCase().includes(memberId)) &&
        (!panNo || String(row.panNo || '').toLowerCase().includes(panNo))
      );
    });
  }, [filters, memberRows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / Number(pageSize)));
  const indexOfLastItem = currentPage * Number(pageSize);
  const indexOfFirstItem = indexOfLastItem - Number(pageSize);
  const tdsRows = useMemo(() => {
    return filteredRows.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredRows, indexOfFirstItem, indexOfLastItem]);

  const onFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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

        <div className="tds-report-table-footer" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', gap: '15px' }}>
          <div style={{ fontWeight: '600', color: '#00d2ff', fontSize: '16px' }}>
            Total Entries: {filteredRows.length}
          </div>
          <div className="tds-report-pagination" style={{ margin: 0 }}>
            <button type="button" className="tds-report-page-btn" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>«</button>
            <button type="button" className="tds-report-page-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>‹</button>
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
                    type="button"
                    className={`tds-report-page-btn ${currentPage === pageNum ? 'tds-report-active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                (pageNum === 2 && currentPage > 3) ||
                (pageNum === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return <span key={pageNum} style={{ color: '#00e5ff', padding: '0 5px' }}>...</span>;
              }
              return null;
            })}
            <button type="button" className="tds-report-page-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
            <button type="button" className="tds-report-page-btn" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>»</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TdsReport;
