import { useMemo, useState, useEffect } from "react";
import "./GenerateEPin.css";
import { generateEpins, getEpinPackages } from '../../../api/managementService';
import { getUser } from '../../../utils/auth';

import { getProfile } from '../../../api/authService';
import { useNavigate } from "react-router-dom";

const GenerateEPin = () => {
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState(0);
  const [packages, setPackages] = useState([]);
  const [flashMessage, setFlashMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchBalanceAndPackages = async () => {
      try {
        const response = await getProfile();
        if (response?.success && response.data) {
          setWalletBalance(response.data.walletBalance || 0);
        }
      } catch (err) {
        console.error("Failed to fetch wallet balance", err);
      }

      try {
        const pkgs = await getEpinPackages();
        if (pkgs?.success && pkgs.packages) {
          setPackages(pkgs.packages);
        }
      } catch (err) {
        console.error("Failed to fetch epin packages", err);
      }
    };
    fetchBalanceAndPackages();
  }, []);

  const defaultGeneratedForId = useMemo(() => {
    try {
      const storedUser = getUser() || {};
      return storedUser.memberId || storedUser.epin || storedUser.id || 'ADMIN';
    } catch (error) {
      return 'ADMIN';
    }
  }, []);

  const [form, setForm] = useState({ 
    epinName: '', 
    qty: '1', 
    cost: '', 
    generatedForId: defaultGeneratedForId, 
    transactionPassword: '' 
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    
    if (name === 'epinName') {
      const selectedPkg = packages.find(p => p.packageName === value);
      setForm((prev) => ({ 
        ...prev, 
        [name]: value,
        cost: selectedPkg ? selectedPkg.price : ''
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const showFlash = (type, text) => {
    setFlashMessage({ type, text });
    setTimeout(() => {
      setFlashMessage({ type: '', text: '' });
    }, 5000);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.epinName) {
      showFlash('error', 'Please select a package.');
      return;
    }
    try {
      const res = await generateEpins({ 
        epinName: form.epinName, 
        generatedBy: form.generatedForId, 
        currentOwner: form.generatedForId, 
        qty: form.qty, 
        cost: form.cost, 
        transactionPassword: form.transactionPassword 
      });
      if (res.success) {
        showFlash('success', 'ePin Generated Successfully!');
        // Update wallet balance if response has it, else fetch again. 
        // A simple way is to just fetch the balance again.
        getProfile().then(profileRes => {
          if (profileRes?.success && profileRes.data) {
            setWalletBalance(profileRes.data.walletBalance || 0);
          }
        });
        // Optionally reset form
        setForm(prev => ({ ...prev, qty: '1', transactionPassword: '' }));
      } else {
        showFlash('error', res.message || "Failed to generate E-Pin");
      }
    } catch (error) {
      showFlash('error', error.response?.data?.message || "Failed to generate E-Pin");
    }
  };

  const totalAmount = useMemo(() => {
    const q = Number(form.qty) || 0;
    const c = Number(form.cost) || 0;
    return q * c;
  }, [form.qty, form.cost]);

  const todayDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).replace(/\//g, '-');

  return (
    <div className="buyepin-container" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh' }}>
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
          {flashMessage.text && (
            <div style={{
              padding: '15px 20px',
              marginBottom: '20px',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: 'bold',
              textAlign: 'center',
              backgroundColor: flashMessage.type === 'success' ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)',
              border: `1px solid ${flashMessage.type === 'success' ? '#10b981' : '#ef4444'}`
            }}>
              {flashMessage.text}
            </div>
          )}
          <form className="buyepin-form-grid" onSubmit={handleSubmit}>
            <div className="buyepin-section buyepin-single-card">
            <div className="buyepin-single-flex">
              <div className="buyepin-single-left">
                <div className="buyepin-form-fields">
                  <div className="buyepin-form-col">
                    <div className="buyepin-input-group">
                      <label>Required No Of ePins</label>
                      <input type="number" name="qty" min="1" value={form.qty} onChange={handleChange} required />
                    </div>
                    
                    <div className="buyepin-input-group">
                      <label>Package</label>
                      <select name="epinName" value={form.epinName} onChange={handleChange} required>
                        <option value="">Select Package</option>
                        {packages.map(pkg => (
                          <option key={pkg._id} value={pkg.packageName}>
                            {pkg.packageName} (₹ {pkg.price})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="buyepin-input-group">
                      <label>Package Amount (Cost)</label>
                      <input type="text" value={totalAmount ? `₹ ${totalAmount}` : ''} readOnly placeholder="Auto-calculated" style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }} />
                    </div>

                    <div className="buyepin-input-group">
                      <label>Generation Date</label>
                      <input type="text" value={todayDate} disabled style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }} />
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GenerateEPin;
