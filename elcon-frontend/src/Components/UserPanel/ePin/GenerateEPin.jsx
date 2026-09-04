import { useMemo, useState, useEffect } from "react";
import "./GenerateEPin.css";
import { generateEpins, getEpinPackages } from '../../../api/managementService';
import { getUser } from '../../../utils/auth';

import { getProfile, getSponsorDetails } from '../../../api/authService';
import { useNavigate } from "react-router-dom";

const GenerateEPin = () => {
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState(0);
  const [packages, setPackages] = useState([]);
  const [flashMessage, setFlashMessage] = useState({ type: '', text: '' });
  const [memberName, setMemberName] = useState('');
  const [memberNameLoading, setMemberNameLoading] = useState(false);
  const [memberNameError, setMemberNameError] = useState('');
  const [generatedEpins, setGeneratedEpins] = useState([]);

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
    transactionPassword: '',
    remark: ''
  });

  useEffect(() => {
    const fetchName = async () => {
      if (!form.generatedForId || form.generatedForId.trim().toUpperCase() === 'ADMIN') {
        setMemberName(form.generatedForId.trim().toUpperCase() === 'ADMIN' ? 'Administrator' : '');
        setMemberNameError('');
        return;
      }
      setMemberNameLoading(true);
      setMemberNameError('');
      try {
        const response = await getSponsorDetails(form.generatedForId.trim());
        if (response.success && response.data?.name) {
          setMemberName(response.data.name);
        } else {
          setMemberNameError('Invalid ID or Member not found');
          setMemberName('');
        }
      } catch (err) {
        setMemberNameError('Invalid ID or Member not found');
        setMemberName('');
      } finally {
        setMemberNameLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchName();
    }, 500);

    return () => clearTimeout(timer);
  }, [form.generatedForId]);

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
        transactionPassword: form.transactionPassword,
        remark: form.remark
      });
      if (res.success) {
        showFlash('success', `${res.epins?.length || Number(form.qty)} ePin(s) Generated Successfully!`);
        setGeneratedEpins(res.epins || []);
        // Refresh wallet balance
        getProfile().then(profileRes => {
          if (profileRes?.success && profileRes.data) {
            setWalletBalance(profileRes.data.walletBalance || 0);
          }
        });
        // Reset form
        setForm(prev => ({ ...prev, qty: '1', transactionPassword: '', remark: '' }));
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

  const insufficientBalance = totalAmount > 0 && walletBalance > 0 && totalAmount > walletBalance;

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

        {flashMessage.text && (
          <div style={{
            padding: '12px 16px',
            marginTop: '14px',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 'bold',
            textAlign: 'center',
            backgroundColor: flashMessage.type === 'success' ? 'rgba(16, 185, 129, 0.85)' : 'rgba(239, 68, 68, 0.85)',
            border: `1px solid ${flashMessage.type === 'success' ? '#10b981' : '#ef4444'}`
          }}>
            {flashMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

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
            <input
              type="text"
              value={totalAmount ? `₹ ${totalAmount}` : ''}
              readOnly
              placeholder="Auto-calculated"
              style={{ backgroundColor: 'var(--bg-card, #1e2730)', cursor: 'not-allowed', opacity: 0.7 }}
            />
            {insufficientBalance && (
              <div style={{
                marginTop: '6px',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                color: '#f59e0b',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ⚠️ Insufficient Balance! Required ₹{totalAmount} · Available ₹{walletBalance.toFixed(2)}
              </div>
            )}
          </div>

          <div className="buyepin-input-group">
            <label>Generation Date</label>
            <input type="text" value={todayDate} disabled style={{ backgroundColor: 'var(--bg-card, #1e2730)', cursor: 'not-allowed', opacity: 0.7 }} />
          </div>

          <div className="buyepin-input-group">
            <label>Generated For ID</label>
            <input type="text" name="generatedForId" value={form.generatedForId} onChange={handleChange} />
            <div style={{ marginTop: '5px', fontSize: '13px', fontWeight: 'bold' }}>
              {memberNameLoading && <span style={{ color: '#888' }}>Fetching name...</span>}
              {!memberNameLoading && memberNameError && <span style={{ color: '#ef4444' }}>{memberNameError}</span>}
              {!memberNameLoading && memberName && <span style={{ color: '#10b981', padding: '2px 8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px' }}>{memberName}</span>}
            </div>
          </div>

          <div className="buyepin-input-group">
            <label>Transaction Password <span className="buyepin-required">*</span></label>
            <input type="password" name="transactionPassword" value={form.transactionPassword} onChange={handleChange} required placeholder="Enter Transaction or Login Password" />
          </div>

          <div className="buyepin-input-group">
            <label>Remark</label>
            <input type="text" name="remark" value={form.remark} onChange={handleChange} placeholder="Enter remark or short note" />
          </div>

          <div style={{ paddingTop: '8px' }}>
            <button className="buyepin-btn-blue" type="submit" style={{ width: '100%', justifyContent: 'center' }}>SUBMIT</button>
          </div>

        </form>

          {generatedEpins.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ color: '#10b981', margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>
                  ✅ {generatedEpins.length} ePin(s) Generated Successfully
                </h3>
                <button
                  type="button"
                  onClick={() => navigate('/user/epin/unused-epin')}
                  style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid #00e5ff', color: '#00e5ff', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                >
                  View All Unused ePins →
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: '#a0aec0' }}>#</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: '#a0aec0' }}>ePin Number</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: '#a0aec0' }}>Package</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: '#a0aec0' }}>Cost</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: '#a0aec0' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedEpins.map((ep, i) => (
                      <tr key={ep.epin} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>{i + 1}</td>
                        <td style={{ padding: '8px 12px', color: '#00e5ff', fontWeight: 'bold', fontFamily: 'monospace' }}>{ep.epin}</td>
                        <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>{ep.epinName}</td>
                        <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>₹ {ep.cost}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                            {ep.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default GenerateEPin;
