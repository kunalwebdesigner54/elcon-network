import { useEffect, useState } from 'react';
import './PlanSetting.css';
import { getPlanSetting } from '../../../../api/managementService';

const ColumnTable = ({title, rows}) => (
  <div className="ps-col">
    <div className="ps-col-head">{title}</div>
    <table className="ps-table">
      <thead><tr><th>LEVEL</th><th>AMOUNT</th></tr></thead>
      <tbody>
        {rows.map((r,i)=> <tr key={i}><td>{String(i+1).padStart(2,'0')}</td><td>{r}</td></tr>)}
      </tbody>
    </table>
  </div>
)

export default function PlanSetting(){
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await getPlanSetting();
        setPlan(response.planSetting || null);
      } catch (error) {
        setPlan(null);
      }
    })();
  }, []);

  const level = plan?.levelIncome || ['00.00','20.00','20.00','20.00','20.00','20.00','20.00','20.00','20.00','20.00'];
  const repurchase = plan?.repurchaseIncome || ['10.00','10.00','10.00','10.00','10.00','10.00','10.00','10.00','10.00','10.00'];
  const donation = plan?.donationIncome || ['300.00','1000.00','2000.00','4000.00','8000.00','16000.00','32000.00','64000.00','128000.00','-'];

  return (
    <div className="plan-page container">
      <h3 className="plan-header">PLAN SETTING</h3>
      <div className="plan-card">
        <ColumnTable title="LEVEL INCOME" rows={level} />
        <ColumnTable title="REPURCHASE INCOME" rows={repurchase} />
        <ColumnTable title="DONATION INCOME" rows={donation} />
      </div>

      <div className="plan-footer">
        <div className="plan-item"><span className="label">TDS CHARGE</span><div className="val">{plan?.tdsCharge || '5 %'}</div></div>
        <div className="plan-item"><span className="label">ADMIN CHRGES</span><div className="val">{plan?.adminCharges || '5 %'}</div></div>
        <div className="plan-item"><span className="label">ID RENEWAL CHARGE</span><div className="val">{plan?.idRenewalCharge || '₹ 350'}</div></div>
      </div>
    </div>
  )
}
