import '../../Common/UserLayout.css';
import './TotalLevelIncome.css';
import { useEffect, useMemo, useState } from 'react';
import { getMyDonations } from '../../../../api/donationsService';

function TotalLevelIncome() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyDonations()
      .then((response) => setRows(response.data?.received || []))
      .catch((loadError) => setError(loadError?.response?.data?.message || 'Failed to load total level income.'))
      .finally(() => setLoading(false));
  }, []);

  const rowsByLevel = useMemo(() => {
    const grouped = new Map();

    rows.forEach((row) => {
      const level = String(row.level || '0');
      grouped.set(level, (grouped.get(level) || 0) + Number(row.amount || 0));
    });

    return Array.from(grouped.entries())
      .sort((left, right) => Number(left[0]) - Number(right[0]))
      .map(([level, amount]) => ({ level: `Level-${level}`, amount }));
  }, [rows]);

  const totalAmount = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return (
    <div>
      <h1 className="user-page-title">Total Level Income</h1>
      <div className="user-panel">
        <h3>Total Level Income : {totalAmount.toFixed(2)}</h3>
        <div className="table-toolbar"><button className="user-btn-outline" type="button">Excel</button></div>
        <div className="table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>SR. NO.</th>
                <th>LEVEL</th>
                <th>TOTAL AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={3}>{error}</td></tr>
              ) : rowsByLevel.length === 0 ? (
                <tr><td colSpan={3}>No level income records found.</td></tr>
              ) : rowsByLevel.map((item, index) => (
                <tr key={item.level}>
                  <td>{index + 1}</td>
                  <td>{item.level}</td>
                  <td>Rs. {item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TotalLevelIncome;
