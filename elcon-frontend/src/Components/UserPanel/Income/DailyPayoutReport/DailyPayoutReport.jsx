import "../../Common/UserLayout.css";
import "./DailyPayoutReport.css";
import { useEffect, useMemo, useState } from 'react';
import { getMyDonations } from '../../../../api/donationsService';

function DailyPayoutReport() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageSize, setPageSize] = useState('10');

  useEffect(() => {
    getMyDonations()
      .then((response) => setRows(response.data?.received || []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load daily payout report.'))
      .finally(() => setLoading(false));
  }, []);

  const dailyPayoutData = useMemo(() => rows.map((row, index) => {
    const grossIncome = Number(row.amount || 0);
    const tds = grossIncome * 0.05;
    const adminCharge = grossIncome * 0.05;
    const netPayable = grossIncome - tds - adminCharge;

    return {
      sNo: index + 1,
      incomeDate: row.date,
      memberId: row.toMemberId,
      memberName: row.toName,
      levelIncome: grossIncome * 0.5,
      repurchaseIncome: grossIncome * 0.5,
      grossIncome,
      tds,
      adminCharge,
      netPayable,
      status: row.status === 'COMPLETED' ? 'Credited To E-wallet' : row.status,
    };
  }).slice(0, Number(pageSize)), [pageSize, rows]);

  const totalPayoutAmount = dailyPayoutData.reduce((sum, row) => sum + row.netPayable, 0);

  return (
    <div>
      <h1 className="user-page-title">Daily Payout Report</h1>
      <div className="user-panel">
        <div className="report-filters">
          <input type="date" placeholder="START DATE" aria-label="Start Date" />
          <input type="date" placeholder="END DATE" aria-label="End Date" />
          <select aria-label="Rows per page" value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="user-btn-blue" type="button">
            SERCH
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
              ) : dailyPayoutData.length === 0 ? (
                <tr><td colSpan={11}>No payout records found.</td></tr>
              ) : dailyPayoutData.map((row) => (
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
              <tr className="report-total-row">
                <td
                  colSpan="09"
                  style={{
                    textAlign: "end",
                  }}
                  className="report-total-label"
                >
                  TOTAL PAYOUT AMOUNT
                </td>
                <td  colSpan="02" className="report-total-value">
                  {totalPayoutAmount.toFixed(2)}
                </td>
              
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pagination-row">
          <button className="page-btn" type="button">
            «
          </button>
          <button className="page-btn" type="button">
            ‹
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
            ›
          </button>
          <button className="page-btn" type="button">
            »
          </button>
        </div>
      </div>
    </div>
  );
}

export default DailyPayoutReport;
