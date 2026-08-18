import '../../Common/UserLayout.css';
import './LevelIncome.css';
import { useEffect, useMemo, useState } from 'react';
import { getMyDonations } from '../../../../api/donationsService';

function LevelIncome() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ level: '', levelId: '', fromMemberName: '', startDate: '', endDate: '', pageSize: '10' });

  useEffect(() => {
    getMyDonations()
      .then((response) => setRows(response.data?.received || []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load level income.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => rows.filter((row) => {
    const rowDate = row.dateRaw ? new Date(row.dateRaw).toISOString().slice(0, 10) : '';
    const matchesLevel = !filters.level || String(row.level) === filters.level;
    const matchesLevelId = !filters.levelId || String(row.fromMemberId || '').toLowerCase().includes(filters.levelId.toLowerCase());
    const matchesFromName = !filters.fromMemberName || String(row.fromName || '').toLowerCase().includes(filters.fromMemberName.toLowerCase());
    const matchesStart = !filters.startDate || rowDate >= filters.startDate;
    const matchesEnd = !filters.endDate || rowDate <= filters.endDate;
    return matchesLevel && matchesLevelId && matchesFromName && matchesStart && matchesEnd;
  }), [filters, rows]);

  const totalAmount = filteredRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const visibleRows = filteredRows.slice(0, Number(filters.pageSize));

  return (
    <div>
      <h1 className="user-page-title">Level Income</h1>
      <div className="user-panel">
        <h3>Total Level Income : {totalAmount.toFixed(2)}</h3>

        <div className="level-income-filters">
          <select aria-label="Level Number" value={filters.level} onChange={(event) => setFilters((prev) => ({ ...prev, level: event.target.value }))}>
            <option value="">LEVEL NO</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <input type="text" placeholder="LEVEL ID" aria-label="Level ID" value={filters.levelId} onChange={(event) => setFilters((prev) => ({ ...prev, levelId: event.target.value }))} />
          <input type="text" placeholder="FROM MEMBER NAME" aria-label="From Member Name" value={filters.fromMemberName} onChange={(event) => setFilters((prev) => ({ ...prev, fromMemberName: event.target.value }))} />
          <input type="date" placeholder="START DATE" aria-label="Start Date" value={filters.startDate} onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))} />
          <input type="date" placeholder="END DATE" aria-label="End Date" value={filters.endDate} onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))} />
          <select aria-label="Rows per page" value={filters.pageSize} onChange={(event) => setFilters((prev) => ({ ...prev, pageSize: event.target.value }))}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="user-btn-blue" type="button">SEARCH</button>
        </div>

        <div className="table-toolbar">
          <button className="user-btn-outline" type="button">Excel</button>
          <button className="user-btn-outline" type="button">PDF</button>
        </div>

        <div className="table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>INCOME DATE & TIME</th>
                <th>MEMBER ID</th>
                <th>MEMBER NAME</th>
                <th>LEVEL NO</th>
                <th>LEVEL ID</th>
                <th>FROM MEMBER NAME</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={8}>{error}</td></tr>
              ) : visibleRows.length === 0 ? (
                <tr><td colSpan={8}>No level income records found.</td></tr>
              ) : (
                <>
                  {visibleRows.map((row, index) => (
                    <tr key={`${row.donationId}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{row.date}</td>
                      <td>{row.toMemberId}</td>
                      <td>{row.toName}</td>
                      <td>{row.level}</td>
                      <td>{row.fromMemberId}</td>
                      <td>{row.fromName}</td>
                      <td>{Number(row.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="level-income-total-row">
                    <td colSpan={7}>TOTAL AMOUNT</td>
                    <td>{totalAmount.toFixed(2)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="level-income-pagination" aria-label="Pagination">
          <button type="button" className="level-income-page-btn" disabled>
            «
          </button>
          <button type="button" className="level-income-page-btn" disabled>
            ‹
          </button>
          <button type="button" className="level-income-page-btn level-income-page-btn-active">
            1
          </button>
          <button type="button" className="level-income-page-btn">2</button>
          <button type="button" className="level-income-page-btn">3</button>
          <button type="button" className="level-income-page-btn">4</button>
          <button type="button" className="level-income-page-btn">5</button>
          <button type="button" className="level-income-page-btn">6</button>
          <button type="button" className="level-income-page-btn">7</button>
          <button type="button" className="level-income-page-btn">›</button>
          <button type="button" className="level-income-page-btn">»</button>
        </div>
      </div>
    </div>
  );
}

export default LevelIncome;
