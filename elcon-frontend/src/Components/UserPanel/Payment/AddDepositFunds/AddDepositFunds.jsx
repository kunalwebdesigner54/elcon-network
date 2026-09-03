import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import qrCode from '../../../../Assets/Pictures/QR-Code.png';
import '../Withdraw/Withdraw.css';
import '../../Common/UserLayout.css';
import './AddDepositFunds.css';
import { createDepositRequest, getMyWithdrawalSummary } from '../../../../api/paymentService';
import { getProfile } from '../../../../api/authService';

const amountPresets = ['₹1000', '₹2000', '₹5000', '₹10000', '₹25000'];
const staticBankDetails = {
  bankName: 'State Bank Of India',
  branch: 'Warje Pune',
  accountHolder: 'Amruta Salunke',
  accountNo: '458885485685',
  accountType: 'Saving Account',
  ifscCode: 'SBIN004736',
  upiId: 'elcon.network@oksbi',
};

function AddDepositFunds() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [amount, setAmount] = useState('');
  const [paymentProof, setPaymentProof] = useState('');
  const [transactionPassword, setTransactionPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [walletSummary, setWalletSummary] = useState({ eWalletBalance: 0, rWalletBalance: 0, totalEarning: 0, totalWithdrawal: 0 });
  const [memberDetails, setMemberDetails] = useState({ name: '', memberId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const summaryAmount = useMemo(() => Number(amount || 0).toFixed(2), [amount]);

  useEffect(() => {
    const loadDepositMeta = async () => {
      try {
        const [summaryResponse, profileResponse] = await Promise.all([getMyWithdrawalSummary(), getProfile()]);

        setWalletSummary(summaryResponse.data || { eWalletBalance: 0, rWalletBalance: 0, totalEarning: 0, totalWithdrawal: 0 });

        if (profileResponse?.data) {
          setMemberDetails({
            name: profileResponse.data.name || '',
            memberId: profileResponse.data.memberId || ''
          });
        }
      } catch (error) {
        setWalletSummary({ eWalletBalance: 0, rWalletBalance: 0, totalEarning: 0, totalWithdrawal: 0 });
      }
    };

    loadDepositMeta();
  }, []);

  const paymentStats = [
    { label: 'E-Wallet Balance', value: `₹ ${Number(walletSummary.eWalletBalance || 0).toFixed(2)}`, tone: 'primary' },
    { label: 'R-Wallet Balance', value: `₹ ${Number(walletSummary.rWalletBalance || 0).toFixed(2)}`, tone: 'primary' },
    { label: 'Total Earning', value: `₹ ${Number(walletSummary.totalEarning || 0).toFixed(2)}`, tone: 'secondary' },
    { label: 'Total Withdrawal', value: `₹ ${Number(walletSummary.totalWithdrawal || 0).toFixed(2)}`, tone: 'secondary' },
  ];

  const bankDetails = staticBankDetails;

  const handlePresetAmount = (preset) => {
    setAmount(preset.replace(/[₹,\s]/g, ''));
  };

  const handleProofUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setPaymentProof(file.name);
    }
  };

  const readFileAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Unable to read payment screenshot'));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a deposit amount');
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      alert('Please upload payment screenshot');
      return;
    }

    if (!transactionPassword || !confirmPassword) {
      alert('Please enter both passwords');
      return;
    }

    if (transactionPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const paymentScreenshot = await readFileAsDataUrl(file);

      await createDepositRequest({
        amount,
        utrNumber: '',
        paymentMode: selectedMethod === 'upi' ? 'UPI ID' : 'BANK TRANSFER',
        paymentScreenshot,
        transactionPassword,
        confirmTransactionPassword: confirmPassword,
        description: 'E-Wallet',
      });

      alert('Deposit request submitted successfully!');
      navigate('/user/deposit/history');
    } catch (error) {
      alert(error?.response?.data?.message || 'Unable to submit deposit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="buyepin-container" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="withdraw-header deposit-funds-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="buyepin-title" style={{ margin: 0, paddingLeft: 0, borderLeft: 'none', fontSize: '26px', fontWeight: '700' }}>Fund Deposit</h1>
        <button type="button" className="deposit-history-link" onClick={() => navigate('/user/deposit/history')}>
          <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: '8px' }}></i> Deposit History
        </button>
      </div>

      <div className="buyepin-single-card deposit-funds-page" style={{ flexGrow: 1, padding: '36px 32px' }}>
        <div style={{ marginBottom: '24px' }}>
          {(memberDetails.name || memberDetails.memberId) && (
            <div className="member-info-badge">
              <i className="fa-regular fa-user"></i>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>{memberDetails.name}</span>
                {memberDetails.memberId && <span>({memberDetails.memberId})</span>}
              </span>
            </div>
          )}
        </div>

        <div className="balance-cards-container deposit-stats-grid">
          {paymentStats.map((item) => (
            <div key={item.label} className={`balance-card ${item.tone}`}>
              <div className="card-icon">💼</div>
              <div className="card-content">
                <p className="card-label">{item.label}</p>
                <p className="card-amount">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="buyepin-single-flex">
          <div className="buyepin-single-left">
            <div className="withdrawal-amount-card deposit-form-card">
              <h3 className="buyepin-section-title">Deposit Details</h3>

              <div className="deposit-form-section">
                <label>Deposit Amount</label>
                <div className="deposit-amount-wrapper">
                  <span className="currency-symbol">₹</span>
                  <input
                    id="deposit-amount"
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="Enter Amount"
                    className="deposit-amount-input"
                  />
                </div>
                <div className="deposit-preset-row">
                  {amountPresets.map((preset) => (
                    <button key={preset} type="button" className="deposit-preset-btn" onClick={() => handlePresetAmount(preset)}>
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="deposit-summary-box">
                <h4 className="deposit-summary-head">Summary</h4>
                <div className="deposit-summary-row">
                  <span className="deposit-summary-label">E-Wallet Deposit Amount</span>
                  <span className="deposit-summary-value">₹ {summaryAmount}</span>
                </div>
              </div>

              <label className="deposit-upload-box">
                <i className="fa-solid fa-cloud-arrow-up deposit-upload-icon"></i>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProofUpload} style={{ display: 'none' }} />
                <span className="deposit-upload-text">{paymentProof || 'Click to Upload Payment Proof Screenshot'}</span>
              </label>

              <div className="deposit-password-field">
                <label>Enter Transaction Password</label>
                <input
                  type="password"
                  value={transactionPassword}
                  onChange={(event) => setTransactionPassword(event.target.value)}
                  placeholder="Enter Transaction Password"
                />
              </div>

              <div className="deposit-password-field">
                <label>Re-enter Transaction Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter Transaction Password"
                />
              </div>

              <button type="button" className="deposit-confirm-btn" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Confirm Deposit'}
              </button>
            </div>
          </div>

          <div className="buyepin-single-right">
            <div className="transfer-method-card deposit-method-card">
              <h3 className="buyepin-section-title">Payment Method</h3>

              <div className={`deposit-method-option ${selectedMethod === 'bank' ? 'is-active' : ''}`}>
                <label className="transfer-label" htmlFor="deposit-bank-transfer">
                  <input
                    id="deposit-bank-transfer"
                    type="radio"
                    name="depositMethod"
                    value="bank"
                    checked={selectedMethod === 'bank'}
                    onChange={(event) => setSelectedMethod(event.target.value)}
                    className="transfer-radio"
                  />
                  <span className="radio-custom"></span>
                  <span className="method-icon">🏦</span>
                  <div className="method-content">
                    <p className="method-name">Bank Transfer</p>
                    <p className="method-note">Amount will be sent to your bank account</p>
                  </div>
                </label>
              </div>

              <div className={`deposit-method-option ${selectedMethod === 'upi' ? 'is-active' : ''}`}>
                <label className="transfer-label" htmlFor="deposit-upi-transfer">
                  <input
                    id="deposit-upi-transfer"
                    type="radio"
                    name="depositMethod"
                    value="upi"
                    checked={selectedMethod === 'upi'}
                    onChange={(event) => setSelectedMethod(event.target.value)}
                    className="transfer-radio"
                  />
                  <span className="radio-custom"></span>
                  <span className="method-icon">📱</span>
                  <div className="method-content">
                    <p className="method-name">UPI Transfer</p>
                    <p className="method-note">Amount will be sent to your UPI ID</p>
                  </div>
                </label>
              </div>

              {selectedMethod === 'upi' ? (
                <div className="deposit-upi-panel">
                  <div className="deposit-qr-frame">
                    <img src={qrCode} alt="UPI QR code" className="deposit-qr-image" />
                  </div>
                  <div className="deposit-upi-row">
                    <span className="deposit-upi-label">UPI ID :</span>
                    <span className="deposit-upi-value">{bankDetails.upiId}</span>
                    <button type="button" className="deposit-copy-btn" aria-label="Copy UPI ID">⧉</button>
                  </div>
                </div>
              ) : (
                <div className="deposit-bank-panel">
                  <div className="deposit-bank-title">
                    <i className="fa-solid fa-building-columns"></i>
                    Bank Account Details
                  </div>

                  <div className="bank-details-grid">
                    <div className="bank-detail-item">
                      <div className="bank-detail-label">Bank Name</div>
                      <div className="bank-detail-value">{bankDetails.bankName}</div>
                    </div>
                    <div className="bank-detail-item">
                      <div className="bank-detail-label">Branch</div>
                      <div className="bank-detail-value">{bankDetails.branch}</div>
                    </div>
                    <div className="bank-detail-item full-width">
                      <div className="bank-detail-label">A/c Holder Name</div>
                      <div className="bank-detail-value">{bankDetails.accountHolder}</div>
                    </div>
                    <div className="bank-detail-item full-width">
                      <div className="bank-detail-label">Account Number</div>
                      <div className="bank-detail-value">{bankDetails.accountNo}</div>
                    </div>
                    <div className="bank-detail-item">
                      <div className="bank-detail-label">Account Type</div>
                      <div className="bank-detail-value">{bankDetails.accountType}</div>
                    </div>
                    <div className="bank-detail-item">
                      <div className="bank-detail-label">IFSC Code</div>
                      <div className="bank-detail-value">{bankDetails.ifscCode}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddDepositFunds;
