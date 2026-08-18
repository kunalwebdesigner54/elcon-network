import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import qrCode from '../../../../Assets/Pictures/QR-Code.png';
import '../Withdraw/Withdraw.css';
import '../../Common/UserLayout.css';
import './AddDepositFunds.css';
import { createDepositRequest, getMyWithdrawalSummary } from '../../../../api/paymentService';

const amountPresets = ['₹1000', '₹2000', '₹5000'];
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

  const summaryAmount = useMemo(() => Number(amount || 0).toFixed(2), [amount]);

  useEffect(() => {
    const loadDepositMeta = async () => {
      try {
        const summaryResponse = await getMyWithdrawalSummary();

        setWalletSummary(summaryResponse.data || { eWalletBalance: 0, rWalletBalance: 0, totalEarning: 0, totalWithdrawal: 0 });
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

    try {
      const paymentScreenshot = await readFileAsDataUrl(file);

      await createDepositRequest({
        amount,
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
    }
  };

  return (
    <div className="withdraw-wrapper deposit-funds-page">
      <div className="withdraw-header deposit-funds-header">
        <h2>Fund Deposit</h2>
        <button type="button" className="deposit-history-link" onClick={() => navigate('/user/deposit/history')}>
          + ADD FUND
        </button>
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

      <div className="withdraw-container deposit-funds-layout">
        <div className="withdraw-left deposit-left">
          <div className="withdrawal-amount-card deposit-form-card">
            <h3 className="card-title">Deposit Amount</h3>

            <div className="amount-input-section">
              <label className="amount-label">Enter Amount (₹)</label>
              <div className="input-wrapper">
                <span className="rupee-icon">₹</span>
                <input
                  id="deposit-amount"
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Enter Amount"
                  className="amount-input"
                />
              </div>
            </div>

            <div className="quick-select-section deposit-preset-row">
              {amountPresets.map((preset) => (
                <button key={preset} type="button" className="quick-btn deposit-preset-btn" onClick={() => handlePresetAmount(preset)}>
                  {preset}
                </button>
              ))}
            </div>

            <div className="withdrawal-summary deposit-summary-box">
              <h4 className="summary-title deposit-summary-head">Deposit Summary</h4>
              <div className="summary-row">
                <span className="summary-label">E-Wallet Deposit Amount</span>
                <span className="summary-value">{summaryAmount}</span>
              </div>
            </div>

            <label className="deposit-upload-box">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProofUpload} />
              <span>{paymentProof || 'Upload Payment Proof Screen Shot'}</span>
            </label>

            <div className="password-field deposit-password-field">
              <label className="password-label">Enter Transaction Password</label>
              <input
                type="password"
                value={transactionPassword}
                onChange={(event) => setTransactionPassword(event.target.value)}
                placeholder="Enter Transaction Password"
                className="password-input"
              />
            </div>

            <div className="password-field deposit-password-field">
              <label className="password-label">Re-enter Transaction Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter Transaction Password"
                className="password-input"
              />
            </div>

            <button type="button" className="confirm-withdrawal-btn deposit-confirm-btn" onClick={handleSubmit}>Confirm Deposit</button>
          </div>
        </div>

        <div className="withdraw-right deposit-right">
          <div className="transfer-method-card deposit-method-card">
            <h3 className="card-title">Account Details to Deposit Amount</h3>

            <div className={`transfer-option deposit-method-option ${selectedMethod === 'bank' ? 'is-active' : ''}`}>
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

            <div className={`transfer-option deposit-method-option ${selectedMethod === 'upi' ? 'is-active' : ''}`}>
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
              <div className="bank-account-details deposit-bank-panel">
                <h4 className="details-title deposit-bank-title">Bank Account Details</h4>
                <table className="details-table deposit-bank-table">
                  <tbody>
                    <tr>
                      <td className="detail-label">Bank Name</td>
                      <td className="detail-value">{bankDetails.bankName}</td>
                    </tr>
                    <tr>
                      <td className="detail-label">Bank Branch</td>
                      <td className="detail-value">{bankDetails.branch}</td>
                    </tr>
                    <tr>
                      <td className="detail-label">A/c Holder Name</td>
                      <td className="detail-value">{bankDetails.accountHolder}</td>
                    </tr>
                    <tr>
                      <td className="detail-label">A/c No.</td>
                      <td className="detail-value">{bankDetails.accountNo}</td>
                    </tr>
                    <tr>
                      <td className="detail-label">A/c Type</td>
                      <td className="detail-value">{bankDetails.accountType}</td>
                    </tr>
                    <tr>
                      <td className="detail-label">IFSC Code</td>
                      <td className="detail-value">{bankDetails.ifscCode}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddDepositFunds;