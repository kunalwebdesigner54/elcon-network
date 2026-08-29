import { useMemo, useState, useEffect } from "react";
import "./GenerateEPin.css";
import { generateEpins } from '../../../api/managementService';
import { getUser } from '../../../utils/auth';

import { getProfile } from '../../../api/authService';
import { useNavigate } from "react-router-dom";

const GenerateEPin = () => {
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await getProfile();
        if (response?.success && response.data) {
          setWalletBalance(response.data.walletBalance || 0);
        }
      } catch (err) {
        console.error("Failed to fetch wallet balance", err);
      }
    };
    fetchBalance();
  }, []);

  const defaultGeneratedForId = useMemo(() => {
    try {
      const storedUser = getUser() || {};
      return storedUser.memberId || storedUser.epin || storedUser.id || 'ADMIN';
    } catch (error) {
      return 'ADMIN';
    }
  }, []);

  const [form, setForm] = useState({ epinName: 'Activation', qty: '1', cost: '10', generatedForId: defaultGeneratedForId, transactionPassword: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await generateEpins({ epinName: form.epinName, generatedBy: form.generatedForId, currentOwner: form.generatedForId, qty: form.qty, cost: form.cost, transactionPassword: form.transactionPassword });
  };

  return (
    <div className="buyepin-container" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 110px)' }}>
      <h1 className="buyepin-title">Generate ePin</h1>
      
      <div className="ge-wallet-section" style={{ flexGrow: 1 }}>
        <div className="ge-balance-cards">
          <div className="ge-balance-card">
            <div className="ge-balance-title">Wallet Balance</div>
            <div className="ge-balance-amount">₹ {walletBalance.toFixed(2)}</div>
          </div>
          <div className="ge-balance-card ge-add-fund-card">
            <button type="button" className="ge-add-fund-btn" onClick={() => navigate('/user/deposit/add-funds')}>
              + Add Fund
            </button>
          </div>
        </div>

        <div className="buyepin-panel" style={{ marginTop: '20px' }}>
          <form className="buyepin-form-grid" onSubmit={handleSubmit}>
            <div className="buyepin-section buyepin-single-card" style={{ padding: '20px 0 0 0' }}>
            <div className="buyepin-single-flex">
              <div className="buyepin-single-left" style={{width: '100%'}}>
                <div className="buyepin-form-fields" style={{width: '100%'}}>
                  <div className="buyepin-form-col" style={{width: '100%'}}>
                    <div className="buyepin-input-group">
                      <label>Required No Of ePins</label>
                      <input type="number" name="qty" min="1" value={form.qty} onChange={handleChange} />
                    </div>
                    <div className="buyepin-input-group">
                      <label>Amount / Cost</label>
                      <input type="number" name="cost" min="1" value={form.cost} onChange={handleChange} />
                    </div>
                    <div className="buyepin-input-group">
                      <label>Package</label>
                      <select name="epinName" value={form.epinName} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="Activation">Activation</option>
                        <option value="basic">Basic</option>
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>
                    <div className="buyepin-input-group">
                      <label>Generation Date</label>
                      <input type="text" value="23-03-2026" disabled />
                    </div>
                    <div className="buyepin-input-group">
                      <label>Generated For ID</label>
                      <input type="text" name="generatedForId" value={form.generatedForId} onChange={handleChange} />
                    </div>
                    <div className="buyepin-input-group">
                      <label>Transaction Password <span className="buyepin-required">*</span></label>
                      <input type="password" name="transactionPassword" value={form.transactionPassword} onChange={handleChange} required placeholder="Enter Transaction or Login Password" />
                    </div>
                  </div>
                </div>
                <div className="buyepin-btn-row">
                  <button className="buyepin-btn-blue" type="submit">SUBMIT</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GenerateEPin;
