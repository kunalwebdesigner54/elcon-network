import React, { useState, useEffect } from 'react';
import "../Common/AdminLayout.css";
import "./AdminSettings.css";
import { changeAdminPasswords, getGlobalSettings, updateGlobalSettings } from "../../../api/managementService";

function AdminSettings() {
  const [activeTab, setActiveTab] = useState('login'); // 'login', 'transaction', or 'global'
  const [globalSettings, setGlobalSettings] = useState({ registrationEnabled: true, memberEpinGenerationEnabled: true, adminEpinGenerationEnabled: true });
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (activeTab === 'global') {
      fetchGlobalSettings();
    }
  }, [activeTab]);

  const fetchGlobalSettings = async () => {
    try {
      const res = await getGlobalSettings();
      if (res.success && res.globalSettings) {
        setGlobalSettings(res.globalSettings);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGlobalSettingsUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await updateGlobalSettings(globalSettings);
      if (res.success) {
        setMessage({ type: 'success', text: 'Global settings updated successfully' });
      } else {
        setMessage({ type: 'error', text: res.message || 'Operation failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Server error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirm password do not match' });
      return;
    }
    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await changeAdminPasswords({
        type: activeTab,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      if (res.success) {
        setMessage({ type: 'success', text: res.message });
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: res.message || 'Operation failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Server error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="panel admin-products-panel">
        <h2 className="section-title admin-products-section-title">ADMIN SETTINGS</h2>

        <div className="settings-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            type="button" 
            className={activeTab === 'login' ? 'btn-primary' : 'btn-secondary'} 
            onClick={() => { setActiveTab('login'); setMessage(null); setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' }); }}
          >
            Change Login Password
          </button>
          <button 
            type="button" 
            className={activeTab === 'transaction' ? 'btn-primary' : 'btn-secondary'} 
            onClick={() => { setActiveTab('transaction'); setMessage(null); setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' }); }}
          >
            Change Transaction Password
          </button>
          <button 
            type="button" 
            className={activeTab === 'global' ? 'btn-primary' : 'btn-secondary'} 
            onClick={() => { setActiveTab('global'); setMessage(null); }}
          >
            Global System Settings
          </button>
        </div>

        {message && (
          <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            {message.text}
          </div>
        )}

        {activeTab !== 'global' ? (
          <form onSubmit={handleSubmit} className="admin-add-product-form">
            <div className="form-group row">
              <label className="col-sm-3 col-form-label">Old Password <span>*</span></label>
              <div className="col-sm-9">
                <input
                  type="password"
                  name="oldPassword"
                  className="text-input"
                  placeholder="Enter Old Password (or leave blank if first time for transaction password)"
                  value={formData.oldPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group row">
              <label className="col-sm-3 col-form-label">New Password <span>*</span></label>
              <div className="col-sm-9">
                <input
                  type="password"
                  name="newPassword"
                  className="text-input"
                  placeholder="Enter New Password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group row">
              <label className="col-sm-3 col-form-label">Confirm Password <span>*</span></label>
              <div className="col-sm-9">
                <input
                  type="password"
                  name="confirmPassword"
                  className="text-input"
                  placeholder="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '20px', textAlign: 'center' }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Processing...' : 'Update Password'}
              </button>
            </div>
          </form>
        ) : (
          <div className="admin-settings-container">
            <div className="settings-header">
              <h2>E-Pin Management Controls</h2>
              <p>Configure Generation and Access Settings</p>
            </div>

            <form onSubmit={handleGlobalSettingsUpdate}>
              <div className="settings-card">
                <div className="settings-card-header">
                  Global E-Pin Settings
                </div>
                <div className="settings-card-body">
                  <div className="toggles-grid">
                    
                    <div className="toggle-item">
                      <h4>Member E-Pin Generation</h4>
                      <div className="toggle-switch-container">
                        <label className="toggle-label">
                          <input type="checkbox" checked={globalSettings.memberEpinGenerationEnabled || false} onChange={(e) => setGlobalSettings({ ...globalSettings, memberEpinGenerationEnabled: e.target.checked })} />
                          <span className="toggle-slider">
                            <span className="toggle-text toggle-text-on">ON</span>
                            <span className="toggle-text toggle-text-off">OFF</span>
                          </span>
                        </label>
                        <span className={`status-badge ${globalSettings.memberEpinGenerationEnabled ? 'enabled' : 'disabled'}`}>
                          {globalSettings.memberEpinGenerationEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <p className="toggle-desc">Members can generate from Wallet</p>
                    </div>

                    <div className="toggle-item">
                      <h4>Admin E-Pin Generation</h4>
                      <div className="toggle-switch-container">
                        <label className="toggle-label">
                          <input type="checkbox" checked={globalSettings.adminEpinGenerationEnabled || false} onChange={(e) => setGlobalSettings({ ...globalSettings, adminEpinGenerationEnabled: e.target.checked })} />
                          <span className="toggle-slider">
                            <span className="toggle-text toggle-text-on">ON</span>
                            <span className="toggle-text toggle-text-off">OFF</span>
                          </span>
                        </label>
                        <span className={`status-badge ${globalSettings.adminEpinGenerationEnabled ? 'enabled' : 'disabled'}`}>
                          {globalSettings.adminEpinGenerationEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <p className="toggle-desc">Admin can generate any amount Pins</p>
                    </div>

                    <div className="toggle-item">
                      <h4>E-Pin Transfer</h4>
                      <div className="toggle-switch-container">
                        <label className="toggle-label">
                          <input type="checkbox" checked={globalSettings.epinTransferEnabled !== false} onChange={(e) => setGlobalSettings({ ...globalSettings, epinTransferEnabled: e.target.checked })} />
                          <span className="toggle-slider">
                            <span className="toggle-text toggle-text-on">ON</span>
                            <span className="toggle-text toggle-text-off">OFF</span>
                          </span>
                        </label>
                        <span className={`status-badge ${globalSettings.epinTransferEnabled !== false ? 'enabled' : 'disabled'}`}>
                          {globalSettings.epinTransferEnabled !== false ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <p className="toggle-desc">Allow Members to transfer Pins</p>
                    </div>

                    <div className="toggle-item">
                      <h4>E-Pin Expiry</h4>
                      <div className="toggle-switch-container">
                        <label className="toggle-label">
                          <input type="checkbox" checked={globalSettings.epinExpiryEnabled || false} onChange={(e) => setGlobalSettings({ ...globalSettings, epinExpiryEnabled: e.target.checked })} />
                          <span className="toggle-slider">
                            <span className="toggle-text toggle-text-on">ON</span>
                            <span className="toggle-text toggle-text-off">OFF</span>
                          </span>
                        </label>
                        <span className={`status-badge ${globalSettings.epinExpiryEnabled ? 'enabled' : 'disabled'}`}>
                          {globalSettings.epinExpiryEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <p className="toggle-desc">Set Pin Expiry limits</p>
                    </div>

                    <div className="toggle-item">
                      <h4>Auto E-Pin Generation</h4>
                      <div className="toggle-switch-container">
                        <label className="toggle-label">
                          <input type="checkbox" checked={globalSettings.autoEpinGeneration || false} onChange={(e) => setGlobalSettings({ ...globalSettings, autoEpinGeneration: e.target.checked })} />
                          <span className="toggle-slider">
                            <span className="toggle-text toggle-text-on">ON</span>
                            <span className="toggle-text toggle-text-off">OFF</span>
                          </span>
                        </label>
                        <span className={`status-badge ${globalSettings.autoEpinGeneration ? 'enabled' : 'disabled'}`}>
                          {globalSettings.autoEpinGeneration ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <p className="toggle-desc">Generate Pins automatically after payment</p>
                    </div>

                  </div>
                </div>
              </div>

              <div className="rules-grid">
                <div className="settings-card" style={{ marginBottom: 0 }}>
                  <div className="settings-card-header">
                    Member Control Rules
                  </div>
                  <div className="settings-card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      
                      <div>
                        <div className="rule-group">
                          <label>Wallet Source</label>
                          <select 
                            className="rule-input"
                            value={globalSettings.walletSource || 'E-Wallet'}
                            onChange={(e) => setGlobalSettings({ ...globalSettings, walletSource: e.target.value })}
                          >
                            <option value="E-Wallet">E-Wallet</option>
                            <option value="Income Wallet">Income Wallet</option>
                          </select>
                        </div>
                        
                        <div className="checkbox-group">
                          <input 
                            type="checkbox" 
                            id="enableOTP" 
                            checked={globalSettings.enableOTP !== false}
                            onChange={(e) => setGlobalSettings({ ...globalSettings, enableOTP: e.target.checked })}
                          />
                          <label htmlFor="enableOTP">Enable OTP for Generation</label>
                        </div>
                      </div>

                      <div>
                        <div className="rule-group">
                          <label>Daily Generation Limit (Per Member)</label>
                          <input 
                            type="number" 
                            className="rule-input" 
                            value={globalSettings.dailyGenerationLimit ?? 10}
                            onChange={(e) => setGlobalSettings({ ...globalSettings, dailyGenerationLimit: parseInt(e.target.value) })}
                          />
                        </div>
                        
                        <div className="rule-group">
                          <label>Minimum Wallet Balance</label>
                          <input 
                            type="number" 
                            className="rule-input" 
                            value={globalSettings.minWalletBalance ?? 500}
                            onChange={(e) => setGlobalSettings({ ...globalSettings, minWalletBalance: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="settings-card summary-card" style={{ marginBottom: 0 }}>
                  <h4 className="summary-title">Live Status Summary</h4>
                  <div className="summary-item">
                    {globalSettings.memberEpinGenerationEnabled ? <i className="fa-solid fa-check-circle"></i> : <i className="fa-solid fa-times-circle"></i>}
                    <div>
                      <strong>MEMBER GENERATION: {globalSettings.memberEpinGenerationEnabled ? 'YES' : 'NO'}</strong>
                    </div>
                  </div>
                  <div className="summary-item">
                    {globalSettings.adminEpinGenerationEnabled ? <i className="fa-solid fa-check-circle"></i> : <i className="fa-solid fa-times-circle"></i>}
                    <div>
                      <strong>ADMIN GENERATION: {globalSettings.adminEpinGenerationEnabled ? 'YES' : 'NO'}</strong>
                    </div>
                  </div>
                  <div className="summary-date">
                    Last Update: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="save-btn-container">
                <button type="submit" className="btn-save-settings" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>

            </form>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminSettings;
