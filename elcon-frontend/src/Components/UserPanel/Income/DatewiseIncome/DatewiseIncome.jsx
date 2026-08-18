import '../../Common/UserLayout.css';
import './DatewiseIncome.css';
import { useEffect, useMemo, useState } from 'react';
import { getMyDonations } from '../../../../api/donationsService';

function DatewiseIncome() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageSize, setPageSize] = useState('10');

  useEffect(() => {
    getMyDonations()
      .then((response) => setRows(response.data?.received || []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load datewise income.'))
      .finally(() => setLoading(false));
  }, []);

  const datewiseIncomeData = useMemo(() => {
    const grouped = new Map();

    rows.forEach((row) => {
      const key = row.dateRaw ? new Date(row.dateRaw).toISOString().slice(0, 10) : row.date;
      const current = grouped.get(key) || { count: 0, amount: 0, latest: row };
      current.count += 1;
      current.amount += Number(row.amount || 0);
      current.latest = row;
      grouped.set(key, current);
    });

    return Array.from(grouped.entries())
      .sort((left, right) => new Date(right[0]).getTime() - new Date(left[0]).getTime())
      .slice(0, Number(pageSize))
      .map(([date, group], index) => ({
        sNo: index + 1,
        incomeDate: date,
        memberId: group.latest.toMemberId,
        totalIds: group.count,
        levelIncome: group.amount * 0.5,
        totalBvPoint: Math.round(group.amount),
        repurchaseIncome: group.amount * 0.5,
        dailyIncome: group.amount,
      }));
  }, [pageSize, rows]);

  const totalAmount = datewiseIncomeData.reduce((sum, row) => sum + row.dailyIncome, 0);

  return (
    <div>
      <h1 className="user-page-title">Datewise Income</h1>
      <div className="user-panel">
        <div className="report-filters">
          <input type="date" placeholder="START DATE" aria-label="Start Date" />
          <input type="date" placeholder="END DATE" aria-label="End Date" />
          <select aria-label="Rows per page" value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="user-btn-blue" type="button">SERCH</button>
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
                <th>INCOME DATE</th>
                <th>MEMBER ID</th>
                <th>TOTAL ID'S</th>
                <th>LEVEL INCOME</th>
                <th>TOTAL BV POINT</th>
                <th>REPURCHASE INCOME</th>
                <th>DAILY INCOME</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={8}>{error}</td></tr>
              ) : datewiseIncomeData.length === 0 ? (
                <tr><td colSpan={8}>No datewise income records found.</td></tr>
              ) : datewiseIncomeData.map((row) => (
                <tr key={row.sNo}>
                  <td>{row.sNo}</td>
                  <td>{row.incomeDate}</td>
                  <td>{row.memberId}</td>
                  <td>{row.totalIds}</td>
                  <td>{row.levelIncome.toFixed(2)}</td>
                  <td>{row.totalBvPoint}</td>
                  <td>{row.repurchaseIncome.toFixed(2)}</td>
                  <td>{row.dailyIncome.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="report-total-row">
                <td style={{
                    textAlign: "end",
                  }} colSpan="7">TOTAL AMOUNT</td>
                <td>{totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pagination-row">
          <button className="page-btn" type="button">«</button>
          <button className="page-btn" type="button">‹</button>
          <button className="page-btn active" type="button">1</button>
          <button className="page-btn" type="button">2</button>
          <button className="page-btn" type="button">3</button>
          <button className="page-btn" type="button">4</button>
          <button className="page-btn" type="button">5</button>
          <button className="page-btn" type="button">6</button>
          <button className="page-btn" type="button">7</button>
          <button className="page-btn" type="button">›</button>
          <button className="page-btn" type="button">»</button>
        </div>
      </div>
    </div>
  );
}

export default DatewiseIncome;
