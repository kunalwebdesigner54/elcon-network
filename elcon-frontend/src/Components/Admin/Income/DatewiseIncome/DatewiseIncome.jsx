import './DatewiseIncome.css';
import { useEffect, useMemo, useState } from 'react';
import { getMemberPerformance } from '../../../../api/membersService';

function DatewiseIncome() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [filterMemberId, setFilterMemberId] = useState('');
  const [filterMemberName, setFilterMemberName] = useState('');
  const [filterDirects, setFilterDirects] = useState('');
  const [filterTotalIds, setFilterTotalIds] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    memberId: '',
    memberName: '',
    directs: '',
    totalIds: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    getMemberPerformance()
      .then((response) => setRows(Array.isArray(response.data) ? response.data : []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load datewise income.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    setAppliedFilters({
      memberId: filterMemberId,
      memberName: filterMemberName,
      directs: filterDirects,
      totalIds: filterTotalIds,
      startDate: filterStartDate,
      endDate: filterEndDate
    });
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

  const adminDatewiseIncomeData = useMemo(() => {
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

    if (appliedFilters.directs) {
      filteredRows = filteredRows.filter(r => {
        const d = r.directsCount ?? r.totalTeamCount ?? r.directs ?? r.unlockLevel ?? 0;
        return String(d).includes(appliedFilters.directs);
      });
    }

    if (appliedFilters.totalIds) {
      filteredRows = filteredRows.filter(r => 
        String(r.totalTeamCount || 0).includes(appliedFilters.totalIds)
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

    return filteredRows.map((row) => ({
      sNo: row.sNo,
      incomeDate: row.joinDate,
      memberId: row.memberId,
      memberName: row.memberName,
      directs: row.directsCount ?? row.totalTeamCount ?? row.directs ?? row.unlockLevel ?? 0,
      totalIds: row.totalTeamCount,
      levelIncome: Number(row.levelIncome || 0),
      totalBvPoint: Number(row.totalTeamCount || 0) * 100,
      repurchaseIncome: Number(row.repurchaseIncome || 0),
      dailyIncome: Number(row.totalIncome || 0),
    }));
  }, [rows, appliedFilters]);

  const totalAmount = adminDatewiseIncomeData.reduce((sum, row) => sum + Number(row.dailyIncome || 0), 0);

  return (
    <div className="datewise-income-report-page">
      <h2 className="datewise-income-screen-title">Datewise Income</h2>

      <section className="panel datewise-income-panel">
        <div className="datewise-income-filter-row">
          <input 
            className="text-input datewise-income-filter-input" 
            placeholder="TO MEMBER ID" 
            value={filterMemberId}
            onChange={(e) => setFilterMemberId(e.target.value)}
          />
          <input 
            className="text-input datewise-income-filter-input" 
            placeholder="MEMBER NAME" 
            value={filterMemberName}
            onChange={(e) => setFilterMemberName(e.target.value)}
          />
          <input 
            className="text-input datewise-income-filter-input" 
            placeholder="DIRECTS" 
            value={filterDirects}
            onChange={(e) => setFilterDirects(e.target.value)}
          />
          <input 
            className="text-input datewise-income-filter-input" 
            placeholder="TOTAL ID'S" 
            value={filterTotalIds}
            onChange={(e) => setFilterTotalIds(e.target.value)}
          />
          <input 
            className="text-input datewise-income-filter-input" 
            type="date" 
            placeholder="START DATE" 
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
          />
          <input 
            className="text-input datewise-income-filter-input" 
            type="date" 
            placeholder="END DATE" 
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
          />
          <select className="select-input datewise-income-filter-input datewise-income-size-select" defaultValue="10">
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="btn-primary datewise-income-search-btn" type="button" onClick={handleSearch}>SEARCH</button>
        </div>

        <div className="datewise-income-export-row">
          <button type="button" className="btn-outline datewise-income-export-btn">XLS</button>
          <button type="button" className="btn-outline datewise-income-export-btn">PDF</button>
        </div>

        <div className="table-wrap datewise-income-table-wrap">
          <table className="data-table datewise-income-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>INCOME DATE</th>
                <th>MEMBER ID</th>
                <th>MEMBER NAME</th>
                <th>DIRECTS</th>
                <th>TOTAL ID'S</th>
                <th>LEVEL INCOME</th>
                <th>TOTAL B.V. POINT</th>
                <th>REPURCHASE INCOME</th>
                <th>DAILY INCOME</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{textAlign: 'center'}}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={10} style={{textAlign: 'center', color: 'red'}}>{error}</td></tr>
              ) : adminDatewiseIncomeData.length === 0 ? (
                <tr><td colSpan={10} style={{textAlign: 'center'}}>No datewise income found.</td></tr>
              ) : (
                <>
                  {adminDatewiseIncomeData.map((row) => (
                    <tr key={row.sNo}>
                      <td>{row.sNo}</td>
                      <td>{row.incomeDate}</td>
                      <td>{row.memberId}</td>
                      <td>{row.memberName}</td>
                      <td>{row.directs}</td>
                      <td>{row.totalIds}</td>
                      <td>{row.levelIncome.toFixed(2)}</td>
                      <td>{row.totalBvPoint}</td>
                      <td>{row.repurchaseIncome.toFixed(2)}</td>
                      <td>{row.dailyIncome.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="datewise-income-summary-row">
                    <td colSpan="9" style={{ textAlign: 'right', fontWeight: 700 }}>TOTAL AMOUNT</td>
                    <td style={{ fontWeight: 700 }}>{totalAmount.toFixed(2)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="datewise-income-table-footer">
          <div className="datewise-income-pagination">
            <button className="datewise-income-page-btn">«</button>
            <button className="datewise-income-page-btn">‹</button>
            <button className="datewise-income-page-btn datewise-income-active">1</button>
            <button className="datewise-income-page-btn">2</button>
            <button className="datewise-income-page-btn">3</button>
            <button className="datewise-income-page-btn">4</button>
            <button className="datewise-income-page-btn">5</button>
            <button className="datewise-income-page-btn">6</button>
            <button className="datewise-income-page-btn">7</button>
            <button className="datewise-income-page-btn">›</button>
            <button className="datewise-income-page-btn">»</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DatewiseIncome;