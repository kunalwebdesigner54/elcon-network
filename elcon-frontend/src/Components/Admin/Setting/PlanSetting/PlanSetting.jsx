import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './PlanSetting.css';
import { getPlanSetting, updatePlanSetting } from '../../../../api/managementService';

export default function PlanSetting() {
  const [plan, setPlan] = useState({
    levelIncome: Array(10).fill(''),
    repurchaseIncome: Array(10).fill(''),
    donationIncome: Array(10).fill(''),
    tdsCharge: '',
    adminCharges: '',
    shippingCharges: '',
    idRenewalCharge: ''
  });
  const [transactionPassword, setTransactionPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const response = await getPlanSetting();
      if (response.planSetting) {
        setPlan(response.planSetting);
      }
    } catch (error) {
      console.error('Failed to load plan setting', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArrayChange = (field, index, value) => {
    setPlan(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const handleChange = (field, value) => {
    setPlan(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transactionPassword) {
      Swal.fire('Error', 'Please enter your Admin Transaction Password', 'error');
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        ...plan,
        transactionPassword
      };
      const response = await updatePlanSetting(payload);
      if (response.success) {
        Swal.fire('Success', 'Plan settings updated successfully!', 'success');
        setTransactionPassword('');
        setPlan(response.planSetting);
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to update plan setting', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="plan-page container"><div className="loading-text">Loading settings...</div></div>;
  }

  const renderColumn = (title, field) => (
    <div className="ps-col-wrapper">
      <div className="ps-col-head">{title}</div>
      <div className="ps-col">
        <table className="ps-table">
          <thead>
            <tr>
              <th>LEVEL</th>
              <th>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {plan[field] && plan[field].map((val, i) => (
              <tr key={i}>
                <td>{String(i + 1).padStart(2, '0')}</td>
                <td>
                  <input 
                    type="text" 
                    className="ps-input-cell" 
                    value={val} 
                    onChange={(e) => handleArrayChange(field, i, e.target.value)} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="plan-page container">
      <h3 className="plan-header">PLAN SETTING</h3>
      <form onSubmit={handleSubmit}>
        <div className="plan-card">
          {renderColumn("LEVEL INCOME", "levelIncome")}
          {renderColumn("DONATION INCOME", "donationIncome")}
        </div>

        <div className="plan-footer-grid">
          <div className="plan-item">
            <span className="label">TDS CHARGE</span>
            <span className="label-icon">%</span>
            <input 
              type="text" 
              className="ps-input-global" 
              value={plan.tdsCharge || ''} 
              onChange={(e) => handleChange("tdsCharge", e.target.value)} 
            />
          </div>
          <div className="plan-item">
            <span className="label">ADMIN CHRGES</span>
            <span className="label-icon">%</span>
            <input 
              type="text" 
              className="ps-input-global" 
              value={plan.adminCharges || ''} 
              onChange={(e) => handleChange("adminCharges", e.target.value)} 
            />
          </div>
          <div className="plan-item">
            <span className="label">SHIPPING CHARGES</span>
            <span className="label-icon">₹</span>
            <input 
              type="text" 
              className="ps-input-global" 
              value={plan.shippingCharges || ''} 
              onChange={(e) => handleChange("shippingCharges", e.target.value)} 
            />
          </div>
          <div className="plan-item">
            <span className="label">ID RENEWAL CHARGE</span>
            <span className="label-icon">₹</span>
            <input 
              type="text" 
              className="ps-input-global" 
              value={plan.idRenewalCharge || ''} 
              onChange={(e) => handleChange("idRenewalCharge", e.target.value)} 
            />
          </div>
        </div>

        <div className="ps-save-section">
          <div className="ps-password-row">
            <span className="password-label">Transaction Password</span>
            <input 
              type="password" 
              className="ps-password-input" 
              value={transactionPassword}
              onChange={(e) => setTransactionPassword(e.target.value)}
              required
            />
          </div>
          <div className="ps-actions">
            <button type="button" className="ps-btn ps-btn-edit">
              EDIT
            </button>
            <button type="submit" className="ps-btn ps-btn-update" disabled={saving}>
              {saving ? 'UPDATING...' : 'UPDATE'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
