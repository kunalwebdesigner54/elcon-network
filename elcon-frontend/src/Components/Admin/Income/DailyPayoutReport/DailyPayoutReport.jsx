import './DailyPayoutReport.css';
import { useEffect, useMemo, useState } from 'react';
import { getMemberPerformance } from '../../../../api/membersService';

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
    getMemberPerformance()
      .then((response) => setRows(Array.isArray(response.data) ? response.data : []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load daily payout report.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    setAppliedFilters({
      memberId: filterMemberId,
      memberName: filterMemberName,
      startDate: filterStartDate,
      endDate: filterEndDate
    });
    setCurrentPage(1);
  };

  const parseDateString = (dateStr) => {
    if (!dateStr) return null;
    const datePart = dateStr.split(' ')[0]; // DD-MM-YYYY
    const parts = datePart.split('-');
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // YYYY-MM-DD
    }
    return new Date(dateStr);
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
      const start = new Date(appliedFilters.startDate);
      start.setHours(0, 0, 0, 0);
      filteredRows = filteredRows.filter(r => {
        const rowDate = parseDateString(r.joinDate);
        return rowDate && rowDate >= start;
      });
    }

    if (appliedFilters.endDate) {
      const end = new Date(appliedFilters.endDate);
      end.setHours(23, 59, 59, 999);
      filteredRows = filteredRows.filter(r => {
        const rowDate = parseDateString(r.joinDate);
        return rowDate && rowDate <= end;
      });
    }

    return filteredRows.map((row) => {
      const levelIncome = Number(row.levelIncome || 0);
      const repurchaseIncome = Number(row.repurchaseIncome || 0);
      const grossIncome = levelIncome + repurchaseIncome;
      const tds = grossIncome * 0.05;
      const adminCharge = grossIncome * 0.05;
      const netPayable = grossIncome - tds - adminCharge;

      return {
        sNo: row.sNo,
        incomeDate: row.joinDate,
        memberId: row.memberId,
        memberName: row.memberName,
        levelIncome,
        repurchaseIncome,
        grossIncome,
        tds,
        adminCharge,
        netPayable,
        status: row.status === 'IN-ACTIVE' ? 'Pending' : 'Credited To E-wallet',
      };
    });
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
          <button type="button" className="btn-outline daily-payout-report-export-btn">XLS</button>
          <button type="button" className="btn-outline daily-payout-report-export-btn">PDF</button>
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
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i + 1} 
                className={`daily-payout-report-page-btn ${currentPage === i + 1 ? 'daily-payout-report-active' : ''}`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="daily-payout-report-page-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
            <button className="daily-payout-report-page-btn" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>»</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DailyPayoutReport;
