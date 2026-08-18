import './RepurchaseIncome.css';
import { useEffect, useMemo, useState } from 'react';
import { getMemberPerformance } from '../../../../api/membersService';

function RepurchaseIncome() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ memberId: '', memberName: '', levelNo: '', levelId: '', fromMemberName: '', pageSize: '10' });

  useEffect(() => {
    getMemberPerformance()
      .then((response) => setRows(Array.isArray(response.data) ? response.data : []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load repurchase income.'))
      .finally(() => setLoading(false));
  }, []);

  const repurchaseIncomeRows = useMemo(() => rows.filter((row) => {
    const matchesMemberId = !filters.memberId || String(row.memberId || '').toLowerCase().includes(filters.memberId.toLowerCase());
    const matchesMemberName = !filters.memberName || String(row.memberName || '').toLowerCase().includes(filters.memberName.toLowerCase());
    const matchesLevelNo = !filters.levelNo || String(row.unlockLevel || '').includes(filters.levelNo);
    const matchesLevelId = !filters.levelId || String(row.memberId || '').toLowerCase().includes(filters.levelId.toLowerCase());
    const matchesFromName = !filters.fromMemberName || String(row.memberName || '').toLowerCase().includes(filters.fromMemberName.toLowerCase());
    return matchesMemberId && matchesMemberName && matchesLevelNo && matchesLevelId && matchesFromName;
  }).slice(0, Number(filters.pageSize)).map((row, index) => ({
    sNo: index + 1,
    incomeDate: row.joinDate,
    memberId: row.memberId,
    memberName: row.memberName,
    levelNo: row.unlockLevel,
    levelId: row.memberId,
    fromMemberName: row.memberName,
    bvPoin: Number(row.repurchaseIncome || 0),
    repurchaseIncome: Number(row.repurchaseIncome || 0),
  })), [filters, rows]);

  const totalRepurchase = repurchaseIncomeRows.reduce((sum, row) => sum + row.repurchaseIncome, 0);

  const updateFilter = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  return (
    <div className="repurchase-income-report-page">
      <h2 className="repurchase-income-screen-title">Repurchase Income</h2>

      <section className="panel repurchase-income-panel">
        <div className="repurchase-income-filter-row">
          <input className="text-input repurchase-income-filter-input" placeholder="MEMBER ID" value={filters.memberId} onChange={updateFilter('memberId')} />
          <input className="text-input repurchase-income-filter-input" placeholder="MEMBER NAME" value={filters.memberName} onChange={updateFilter('memberName')} />
          <input className="text-input repurchase-income-filter-input" placeholder="LEVEL NO" value={filters.levelNo} onChange={updateFilter('levelNo')} />
          <input className="text-input repurchase-income-filter-input" placeholder="LEVEL ID" value={filters.levelId} onChange={updateFilter('levelId')} />
          <input className="text-input repurchase-income-filter-input" placeholder="FROM MEMBER NAME" value={filters.fromMemberName} onChange={updateFilter('fromMemberName')} />
          <select className="select-input repurchase-income-filter-input repurchase-income-size-select" value={filters.pageSize} onChange={updateFilter('pageSize')}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="btn-primary repurchase-income-search-btn" type="button">Search</button>
        </div>

        <div className="repurchase-income-export-row">
          <button type="button" className="btn-outline repurchase-income-export-btn">XLS</button>
          <button type="button" className="btn-outline repurchase-income-export-btn">PDF</button>
        </div>

        <div className="table-wrap repurchase-income-table-wrap">
          <table className="data-table repurchase-income-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>INCOME DATE & TIME</th>
                <th>MEMBER ID</th>
                <th>MEMBER NAME</th>
                <th>LEVEL NO</th>
                <th>LEVEL ID</th>
                <th>FROM MEMBER NAME</th>
                <th>BV POIN</th>
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
              <tr className="repurchase-income-summary-row">
                <td colSpan="8" style={{ textAlign: 'right', fontWeight: 700 }}>TOTAL AMOUNT</td>
                <td>{totalRepurchase.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="repurchase-income-table-footer">
          <div className="repurchase-income-pagination">
            <button className="repurchase-income-page-btn">«</button>
            <button className="repurchase-income-page-btn">‹</button>
            <button className="repurchase-income-page-btn repurchase-income-active">1</button>
            <button className="repurchase-income-page-btn">2</button>
            <button className="repurchase-income-page-btn">3</button>
            <button className="repurchase-income-page-btn">4</button>
            <button className="repurchase-income-page-btn">5</button>
            <button className="repurchase-income-page-btn">6</button>
            <button className="repurchase-income-page-btn">7</button>
            <button className="repurchase-income-page-btn">›</button>
            <button className="repurchase-income-page-btn">»</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default RepurchaseIncome;