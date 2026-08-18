import './LevelIncomeReports.css';
import { useEffect, useMemo, useState } from 'react';
import { getMemberPerformance } from '../../../../api/membersService';

function LevelIncomeReports() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMemberPerformance()
      .then((response) => setRows(Array.isArray(response.data) ? response.data : []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load level income reports.'))
      .finally(() => setLoading(false));
  }, []);

  const levelIncomeReportsData = useMemo(() => rows.map((row) => ({
    sNo: row.sNo,
    incomeDateTime: row.joinDate,
    memberId: row.memberId,
    memberName: row.memberName,
    unlockLevel: row.unlockLevel,
    levelNo: row.joiningLevel,
    levelId: row.memberId,
    fromMemberName: row.memberName,
    amount: Number(row.levelIncome || 0),
  })), [rows]);

  const totalAmount = levelIncomeReportsData.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return (
    <div className="level-income-report-page">
      <h2 className="level-income-screen-title">Level Income Reports</h2>

      <section className="panel level-income-panel">
        <div className="level-income-filter-row">
          <input className="text-input level-income-filter-input" placeholder="MEMBER ID" />
          <input className="text-input level-income-filter-input" placeholder="MEMBER NAME" />
          <input className="text-input level-income-filter-input" placeholder="LEVEL NO" />
          <input className="text-input level-income-filter-input" placeholder="LEVEL ID" />
          <input className="text-input level-income-filter-input" type="date" placeholder="START DATE" />
          <input className="text-input level-income-filter-input" type="date" placeholder="END DATE" />
          <select className="select-input level-income-filter-input level-income-size-select" defaultValue="10">
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="btn-primary level-income-search-btn" type="button">SERCH</button>
        </div>

        <div className="level-income-export-row">
          <button type="button" className="btn-outline level-income-export-btn">XLS</button>
          <button type="button" className="btn-outline level-income-export-btn">PDF</button>
        </div>

        <div className="table-wrap level-income-table-wrap">
          <table className="data-table level-income-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>INCOME DATE & TIME</th>
                <th>MEMBER ID</th>
                <th>MEMBER NAME</th>
                <th>UNLOCK LEVEL</th>
                <th>LEVEL NO</th>
                <th>LEVEL ID</th>
                <th>FROM MEMBER NAME</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={9}>{error}</td></tr>
              ) : levelIncomeReportsData.length === 0 ? (
                <tr><td colSpan={9}>No level income reports found.</td></tr>
              ) : (
                <>
                  {levelIncomeReportsData.map((row) => (
                    <tr key={row.memberId}>
                      <td>{row.sNo}</td>
                      <td>{row.incomeDateTime}</td>
                      <td>{row.memberId}</td>
                      <td>{row.memberName}</td>
                      <td>{row.unlockLevel}</td>
                      <td>{row.levelNo}</td>
                      <td>{row.levelId}</td>
                      <td>{row.fromMemberName}</td>
                      <td>{Number(row.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="level-income-summary-row">
                    <td colSpan="8" style={{ textAlign: 'right', fontWeight: 700 }}>
                      TOTAL AMOUNT
                    </td>
                    <td>{totalAmount.toFixed(2)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="level-income-table-footer">
          <div className="level-income-pagination">
            <button className="level-income-page-btn">«</button>
            <button className="level-income-page-btn">‹</button>
            <button className="level-income-page-btn level-income-active">1</button>
            <button className="level-income-page-btn">2</button>
            <button className="level-income-page-btn">3</button>
            <button className="level-income-page-btn">4</button>
            <button className="level-income-page-btn">5</button>
            <button className="level-income-page-btn">6</button>
            <button className="level-income-page-btn">7</button>
            <button className="level-income-page-btn">›</button>
            <button className="level-income-page-btn">»</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LevelIncomeReports;