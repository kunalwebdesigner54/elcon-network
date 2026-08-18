import './LevelIncome.css';
import { useEffect, useMemo, useState } from 'react';
import { getMemberPerformance } from '../../../../api/membersService';

function LevelIncome() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMemberPerformance()
      .then((response) => setRows(Array.isArray(response.data) ? response.data : []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load level income report.'))
      .finally(() => setLoading(false));
  }, []);

  const levelIncomeRows = useMemo(() => rows.map((row) => ({
    sNo: row.sNo,
    incomeDate: row.joinDate,
    memberId: row.memberId,
    memberName: row.memberName,
    unlockLevel: row.unlockLevel,
    levelId: row.memberId,
    fromMemberName: row.memberName,
    levelNo: row.joiningLevel,
    amount: Number(row.levelIncome || 0),
  })), [rows]);

  const totalAmount = levelIncomeRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return (
    <div className="tds-report-page">
      <h2 className="section-title tds-screen-title">Level Income Reports</h2>

      <section className="panel tds-panel">
       

        <div className="tds-filter-row">
          
          <input className="text-input tds-filter-input" placeholder="MEMBER ID" />
          <input className="text-input tds-filter-input" placeholder="MEMBER NAME" />
          <input className="text-input tds-filter-input" placeholder="LEVEL NO" />
            <input className="text-input tds-filter-input" placeholder="LEVEL ID" />
          <input className="text-input tds-filter-input" placeholder="START DATE" />
          <input className="text-input tds-filter-input" placeholder="END DATE" />
          <select className="select-input tds-filter-input tds-size-select" defaultValue="10">
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="btn-primary tds-search-btn" type="button">Search</button>
        </div>


         <div className="btn-row tds-export-row">
          <button type="button" className="btn-outline tds-export-btn">XLS</button>
          <button type="button" className="btn-outline tds-export-btn">PDF</button>
        </div>

        <div className="table-wrap tds-table-wrap">
          <table className="data-table tds-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>INCOME DATE</th>
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
              ) : levelIncomeRows.length === 0 ? (
                <tr><td colSpan={9}>No level income records found.</td></tr>
              ) : levelIncomeRows.map((row) => (
                <tr key={row.memberId}>
                  <td>{row.sNo}</td>
                  <td>{row.incomeDate}</td>
                  <td>{row.memberId}</td>
                  <td>{row.memberName}</td>
                  <td>{row.unlockLevel}</td>
                  <td>{row.levelNo}</td>
                  <td>{row.levelId}</td>
                  <td>{row.fromMemberName}</td>
                  <td>{Number(row.amount || 0).toFixed(2)}</td>
                </tr>
              ))}
              {levelIncomeRows.length > 0 && (
                <tr className="level-income-summary-row">
                  <td colSpan="8" style={{ textAlign: 'right', fontWeight: 700 }}>
                    TOTAL AMOUNT
                  </td>
                  <td>{totalAmount.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer" style={{ justifyContent: 'center', marginTop: '12px' }}>
          <div className="pagination">
            <button className="page-btn">&laquo;</button>
            <button className="page-btn">&lsaquo;</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">4</button>
            <button className="page-btn">5</button>
            <button className="page-btn">6</button>
            <button className="page-btn">7</button>
            <button className="page-btn">&rsaquo;</button>
            <button className="page-btn">&raquo;</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LevelIncome;
