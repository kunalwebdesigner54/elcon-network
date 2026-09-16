import React from 'react';
import "../../Common/UserLayout.css";
import "./DailyPayoutReport.css";
import { useEffect, useMemo, useState } from 'react';
import { getMyDailyPayout } from '../../../../api/membersService';

function DailyPayoutReport() {
  const [page, setPage] = React.useState(1);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageSize, setPageSize] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getMyDailyPayout()
      .then((response) => setRows(Array.isArray(response.data) ? response.data : []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load daily payout report.'))
      .finally(() => setLoading(false));
  }, []);

  const dailyPayoutData = useMemo(() => rows.map((row, index) => {
    const levelIncome = Number(row.levelIncome || 0);
    const repurchaseIncome = Number(row.repurchaseIncome || 0);
    const grossIncome = Number(row.grossIncome !== undefined ? row.grossIncome : (row.amount || (levelIncome + repurchaseIncome)));
    const tds = Number(row.tds !== undefined ? row.tds : (grossIncome * 0.05));
    const adminCharge = Number(row.adminCharge !== undefined ? row.adminCharge : (grossIncome * 0.05));
    const netPayable = Number(row.netPayable !== undefined ? row.netPayable : (grossIncome - tds - adminCharge));

    return {
      sNo: index + 1,
      incomeDate: row.incomeDate || row.date,
      memberId: row.memberId || row.toMemberId,
      memberName: row.memberName || row.toName,
      levelIncome: row.levelIncome !== undefined ? levelIncome : (grossIncome * 0.5),
      repurchaseIncome: row.repurchaseIncome !== undefined ? repurchaseIncome : (grossIncome * 0.5),
      grossIncome,
      tds,
      adminCharge,
      netPayable,
      status: row.status === 'COMPLETED' ? 'Credited To E-wallet' : (row.status || 'Credited To E-wallet'),
    };
  }), [rows]);

  const indexOfLastItem = currentPage * Number(pageSize);
  const indexOfFirstItem = indexOfLastItem - Number(pageSize);
  const visibleRows = dailyPayoutData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(dailyPayoutData.length / Number(pageSize)));

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPayoutAmount = visibleRows.reduce((sum, row) => sum + row.netPayable, 0);

  return (
    <div>
      <h1 className="user-page-title">Daily Payout Report</h1>
      <div className="user-panel">
        <div className="report-filters">
          <input type="date" placeholder="START DATE" aria-label="Start Date" />
          <input type="date" placeholder="END DATE" aria-label="End Date" />
          <select aria-label="Rows per page" value={pageSize} onChange={(event) => { setPageSize(event.target.value); setCurrentPage(1); }}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="user-btn-blue" type="button" onClick={() => setCurrentPage(1)}>
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
          <table className="data-table">
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
              ) : visibleRows.map((row) => (
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
                  PAGE TOTAL PAYOUT AMOUNT
                </td>
                <td  colSpan="02" className="report-total-value">
                  {totalPayoutAmount.toFixed(2)}
                </td>

              </tr>
            </tbody>
          </table>
        </div>

        <div className="table-footer" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', gap: '15px', background: 'rgba(0, 229, 255, 0.05)', padding: '16px', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: '12px' }}>
          <div style={{ fontWeight: '700', color: '#00e5ff', fontSize: '16px', letterSpacing: '0.5px' }}>
            <i className="fa-solid fa-chart-pie" style={{ marginRight: '8px' }}></i>
            Total Entries : {dailyPayoutData.length}
          </div>
          <div className="pagination">
                <button className="page-btn" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>&lt;&lt;</button>
                <button className="page-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  let s = Math.max(1, currentPage - 1);
                  let e = Math.min(totalPages, s + 2);
                  if (e - s < 2) s = Math.max(1, e - 2);
                  if (p < s || p > e) return null;
                  return (
                    <button 
                      key={p} 
                      className={`page-btn ${currentPage === p ? 'active' : ''}`}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  );
                })}
                <button className="page-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                <button className="page-btn" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>&gt;&gt;</button>
              </div>
        </div>
      </div>
    </div>
  );
}

export default DailyPayoutReport;
