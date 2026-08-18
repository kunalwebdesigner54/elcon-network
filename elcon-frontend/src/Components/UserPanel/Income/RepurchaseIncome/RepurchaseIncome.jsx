import "../../Common/UserLayout.css";
import "./RepurchaseIncome.css";
import { useEffect, useMemo, useState } from 'react';
import { getMyDonations } from '../../../../api/donationsService';

function RepurchaseIncome() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ levelNo: '', levelId: '', fromMemberName: '', startDate: '', endDate: '', pageSize: '10' });

  useEffect(() => {
    getMyDonations()
      .then((response) => setRows(response.data?.received || []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load repurchase income.'))
      .finally(() => setLoading(false));
  }, []);

  const repurchaseIncomeRows = useMemo(() => rows.filter((row) => {
    const rowDate = row.dateRaw ? new Date(row.dateRaw).toISOString().slice(0, 10) : '';
    const matchesLevelNo = !filters.levelNo || String(row.level) === filters.levelNo;
    const matchesLevelId = !filters.levelId || String(row.fromMemberId || '').toLowerCase().includes(filters.levelId.toLowerCase());
    const matchesFromName = !filters.fromMemberName || String(row.fromName || '').toLowerCase().includes(filters.fromMemberName.toLowerCase());
    const matchesStart = !filters.startDate || rowDate >= filters.startDate;
    const matchesEnd = !filters.endDate || rowDate <= filters.endDate;
    return matchesLevelNo && matchesLevelId && matchesFromName && matchesStart && matchesEnd;
  }).slice(0, Number(filters.pageSize)).map((row, index) => ({
    sNo: index + 1,
    incomeDate: row.date,
    memberId: row.toMemberId,
    memberName: row.toName,
    levelNo: row.level,
    levelId: row.fromMemberId,
    fromMemberName: row.fromName,
    bvPoin: Number(row.amount || 0),
    repurchaseIncome: Number(row.amount || 0),
  })), [filters, rows]);

  const totalRepurchase = repurchaseIncomeRows.reduce((sum, row) => sum + row.repurchaseIncome, 0);

  const updateFilter = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  return (
    <div>
      <h1 className="user-page-title">Repurchase Income</h1>
      <div className="user-panel">
        <h3>Total Repurchase Income : {totalRepurchase.toFixed(2)}</h3>

        <div className="report-filters">
          <select aria-label="Level No" value={filters.levelNo} onChange={updateFilter('levelNo')}>
            <option value="">LEVEL NO</option>
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
          <input type="text" placeholder="LEVEL ID" aria-label="Level ID" value={filters.levelId} onChange={updateFilter('levelId')} />
          <input
            type="text"
            placeholder="FROM MEMBER NAME"
            aria-label="From Member Name"
            value={filters.fromMemberName}
            onChange={updateFilter('fromMemberName')}
          />
          <input type="date" placeholder="START DATE" aria-label="Start Date" value={filters.startDate} onChange={updateFilter('startDate')} />
          <input type="date" placeholder="END DATE" aria-label="End Date" value={filters.endDate} onChange={updateFilter('endDate')} />
          <select aria-label="Rows per page" value={filters.pageSize} onChange={updateFilter('pageSize')}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="user-btn-blue" type="button">
            SEARCH
          </button>
        </div>

        <div className="table-toolbar">
          <button className="user-btn-outline" type="button">
            Excel
          </button>
          <button className="user-btn-outline" type="button">
            PDF
          </button>
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
                <th>BV POINT</th>
                <th>REPURCHASE INCOME</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={9}>{error}</td></tr>
              ) : repurchaseIncomeRows.length === 0 ? (
                <tr><td colSpan={9}>No repurchase income records found.</td></tr>
              ) : repurchaseIncomeRows.map((row) => (
                <tr key={row.sNo}>
                  <td>{row.sNo}</td>
                  <td>{row.incomeDate}</td>
                  <td>{row.memberId}</td>
                  <td>{row.memberName}</td>
                  <td>{row.levelNo}</td>
                  <td>{row.levelId}</td>
                  <td>{row.fromMemberName}</td>
                  <td>{row.bvPoin}</td>
                  <td>{row.repurchaseIncome.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="report-total-row">
                <td
                  colSpan="8"
                  style={{ textAlign: 'end' }}
                  className="report-total-label"
                >
                  TOTAL REPURCHASE INCOME
                </td>
                <td className="report-total-value">
                  {totalRepurchase.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pagination-row">
          <button className="page-btn" type="button">
            «
          </button>
          <button className="page-btn active" type="button">
            1
          </button>
          <button className="page-btn" type="button">
            2
          </button>
          <button className="page-btn" type="button">
            3
          </button>
          <button className="page-btn" type="button">
            4
          </button>
          <button className="page-btn" type="button">
            5
          </button>
          <button className="page-btn" type="button">
            6
          </button>
          <button className="page-btn" type="button">
            7
          </button>
          <button className="page-btn" type="button">
            »
          </button>
        </div>
      </div>
    </div>
  );
}

export default RepurchaseIncome;
