import './DailyPayoutReport.css';
import { useEffect, useMemo, useState } from 'react';
import { getMemberPerformance } from '../../../../api/membersService';

function DailyPayoutReport() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMemberPerformance()
      .then((response) => setRows(Array.isArray(response.data) ? response.data : []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load daily payout report.'))
      .finally(() => setLoading(false));
  }, []);

  const adminDailyPayoutData = useMemo(() => rows.map((row) => {
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
  }), [rows]);

  const totalPayoutAmount = adminDailyPayoutData.reduce((sum, row) => sum + Number(row.netPayable || 0), 0);

  return (
    <div className="daily-payout-report-report-page">
      <h2 className="daily-payout-report-screen-title">Daily Payout Report</h2>

      <section className="panel daily-payout-report-panel">
        <div className="daily-payout-report-filter-row">
          <input className="text-input daily-payout-report-filter-input" placeholder="MEMBER ID" />
          <input className="text-input daily-payout-report-filter-input" placeholder="MEMBER NAME" />
          <input className="text-input daily-payout-report-filter-input" type="date" placeholder="START DATE" />
          <input className="text-input daily-payout-report-filter-input" type="date" placeholder="END DATE" />
          <select className="select-input daily-payout-report-filter-input daily-payout-report-size-select" defaultValue="10">
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="btn-primary daily-payout-report-search-btn" type="button">SERCH</button>
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
                <tr><td colSpan={11}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={11}>{error}</td></tr>
              ) : adminDailyPayoutData.length === 0 ? (
                <tr><td colSpan={11}>No payout data found.</td></tr>
              ) : (
                <>
                  {adminDailyPayoutData.map((row) => (
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
                    <td colSpan="10" style={{ textAlign: 'right', fontWeight: 700 }}>TOTAL PAYOUT AMOUNT</td>
                    <td>{totalPayoutAmount.toFixed(2)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="daily-payout-report-table-footer">
          <div className="daily-payout-report-pagination">
            <button className="daily-payout-report-page-btn">«</button>
            <button className="daily-payout-report-page-btn">‹</button>
            <button className="daily-payout-report-page-btn daily-payout-report-active">1</button>
            <button className="daily-payout-report-page-btn">2</button>
            <button className="daily-payout-report-page-btn">3</button>
            <button className="daily-payout-report-page-btn">4</button>
            <button className="daily-payout-report-page-btn">5</button>
            <button className="daily-payout-report-page-btn">6</button>
            <button className="daily-payout-report-page-btn">7</button>
            <button className="daily-payout-report-page-btn">›</button>
            <button className="daily-payout-report-page-btn">»</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DailyPayoutReport;