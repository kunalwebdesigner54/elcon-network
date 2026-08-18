import './DatewiseIncome.css';
import { useEffect, useMemo, useState } from 'react';
import { getMemberPerformance } from '../../../../api/membersService';

function DatewiseIncome() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMemberPerformance()
      .then((response) => setRows(Array.isArray(response.data) ? response.data : []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load datewise income.'))
      .finally(() => setLoading(false));
  }, []);

  const adminDatewiseIncomeData = useMemo(() => rows.map((row) => ({
    sNo: row.sNo,
    incomeDate: row.joinDate,
    memberId: row.memberId,
    unlockLevel: row.unlockLevel,
    totalIds: row.totalTeamCount,
    levelIncome: Number(row.levelIncome || 0),
    totalBvPoint: Number(row.totalTeamCount || 0) * 100,
    repurchaseIncome: Number(row.repurchaseIncome || 0),
    dailyIncome: Number(row.totalIncome || 0),
  })), [rows]);

  const totalAmount = adminDatewiseIncomeData.reduce((sum, row) => sum + Number(row.dailyIncome || 0), 0);

  return (
    <div className="datewise-income-report-page">
      <h2 className="datewise-income-screen-title">Datewise Income</h2>

      <section className="panel datewise-income-panel">
        <div className="datewise-income-filter-row">
          <input className="text-input datewise-income-filter-input" placeholder="TO MEMBER ID" />
          <input className="text-input datewise-income-filter-input" placeholder="UNLOCK LEVEL" />
          <input className="text-input datewise-income-filter-input" placeholder="TOTAL ID'S" />
          <input className="text-input datewise-income-filter-input" type="date" placeholder="START DATE" />
          <input className="text-input datewise-income-filter-input" type="date" placeholder="END DATE" />
          <select className="select-input datewise-income-filter-input datewise-income-size-select" defaultValue="10">
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="btn-primary datewise-income-search-btn" type="button">SERCH</button>
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
                <th>UNLOCK LEVEL</th>
                <th>TOTAL ID'S</th>
                <th>LEVEL INCOME</th>
                <th>TOTAL B.V. POINT</th>
                <th>REPURCHASE INCOME</th>
                <th>DAILY INCOME</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={9}>{error}</td></tr>
              ) : adminDatewiseIncomeData.length === 0 ? (
                <tr><td colSpan={9}>No datewise income found.</td></tr>
              ) : (
                <>
                  {adminDatewiseIncomeData.map((row) => (
                    <tr key={row.sNo}>
                      <td>{row.sNo}</td>
                      <td>{row.incomeDate}</td>
                      <td>{row.memberId}</td>
                      <td>{row.unlockLevel}</td>
                      <td>{row.totalIds}</td>
                      <td>{row.levelIncome.toFixed(2)}</td>
                      <td>{row.totalBvPoint}</td>
                      <td>{row.repurchaseIncome.toFixed(2)}</td>
                      <td>{row.dailyIncome.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="datewise-income-summary-row">
                    <td colSpan="8" style={{ textAlign: 'right', fontWeight: 700 }}>TOTAL AMOUNT</td>
                    <td>{totalAmount.toFixed(2)}</td>
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