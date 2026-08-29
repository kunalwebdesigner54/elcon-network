import React, { useEffect, useState } from 'react';
import './Withdraw.css';
import { getProfile } from '../../../../api/authService';
import { createWithdrawalRequest, getMyWithdrawalSummary } from '../../../../api/paymentService';

const Withdraw = () => {
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState('bank');
  const [transactionPassword, setTransactionPassword] = useState('');
  const [reenterPassword, setReenterPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletData, setWalletData] = useState({
    eWalletBalance: 0,
    rWalletBalance: 0,
    totalEarning: 0,
    totalWithdrawal: 0,
  });
  const [bankDetails, setBankDetails] = useState({
    bankName: '-',
    branch: '-',
    accountHolder: '-',
    accountNo: '-',
    accountType: '-',
    ifscCode: '-',
    upiId: '-',
  });
  const [memberDetails, setMemberDetails] = useState({
    name: '',
    memberId: ''
  });

  useEffect(() => {
    const loadWithdrawData = async () => {
      try {
        const [profileResponse, summaryResponse] = await Promise.all([getProfile(), getMyWithdrawalSummary()]);
        const profile = profileResponse.data || {};
        const summary = summaryResponse.data || {};

        setBankDetails({
          bankName: profile.bankDetails?.bankName || '-',
          branch: profile.bankDetails?.bankBranch || '-',
          accountHolder: profile.bankDetails?.holderName || profile.name || '-',
          accountNo: profile.bankDetails?.accountNo || '-',
          accountType: profile.bankDetails?.accountType || 'Saving Account',
          ifscCode: profile.bankDetails?.ifsc || '-',
          upiId: profile.paymentDetails?.upiId || '-',
        });

        setWalletData({
          eWalletBalance: Number(summary.eWalletBalance ?? profile.walletBalance ?? 0),
          rWalletBalance: Number(summary.rWalletBalance ?? 0),
          totalEarning: Number(summary.totalEarning ?? profile.walletBalance ?? 0),
          totalWithdrawal: Number(summary.totalWithdrawal ?? 0),
        });

        setMemberDetails({
          name: profile.name || '',
          memberId: profile.memberId || ''
        });
      } catch (error) {
        // Keep fallback values when the profile or summary request fails.
      }
    };

    loadWithdrawData();
  }, []);

  const transactionFee = 0; // Dynamic based on amount
  const youWillReceive = withdrawalAmount ? (parseFloat(withdrawalAmount) - transactionFee) : 0;

  const handleQuickSelect = (amount) => {
    setWithdrawalAmount(amount.toString());
  };

  const handleConfirmWithdrawal = () => {
    const amount = parseFloat(withdrawalAmount);
    if (!withdrawalAmount || amount <= 0) {
      alert('Please enter a withdrawal amount');
      return;
    }
    if (amount < 1000 || amount > 10000) {
      alert('Withdrawal amount must be between ₹1,000 and ₹10,000');
      return;
    }
    if (!transactionPassword || !reenterPassword) {
      alert('Please enter both passwords');
      return;
    }
    if (transactionPassword !== reenterPassword) {
      alert('Passwords do not match');
      return;
    }
    setIsSubmitting(true);
    createWithdrawalRequest({
      amount: withdrawalAmount,
      paymentMethod: selectedTransfer,
      transactionPassword,
      confirmTransactionPassword: reenterPassword,
    })
      .then(() => {
        alert(`Withdrawal of ₹${withdrawalAmount} initiated successfully!`);
        setWithdrawalAmount('');
        setTransactionPassword('');
        setReenterPassword('');
      })
      .catch((error) => {
        alert(error?.response?.data?.message || 'Unable to initiate withdrawal');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="buyepin-container" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="withdraw-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="buyepin-title" style={{ margin: 0, paddingLeft: 0, borderLeft: 'none' }}>Withdraw</h1>
      </div>
      
      <div className="buyepin-single-card" style={{ flexGrow: 1, padding: '36px 32px' }}>
        <div style={{ marginBottom: '24px' }}>
          {(memberDetails.name || memberDetails.memberId) && (
            <div className="member-info-badge" style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '20px', fontSize: '15px', fontWeight: '600', color: 'var(--text-main)', border: '1px solid var(--glass-border)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-regular fa-user" style={{ color: '#00e5ff' }}></i>
              {memberDetails.name} {memberDetails.memberId ? `(${memberDetails.memberId})` : ''}
            </div>
          )}
        </div>

      {/* Wallet Balance Cards */}
      <div className="balance-cards-container">
        <div className="balance-card primary">
          <div className="card-icon">💼</div>
          <div className="card-content">
            <p className="card-label">E-Wallet Balance</p>
            <p className="card-amount">₹ {walletData.eWalletBalance.toFixed(2)}</p>
          </div>
        </div>

        <div className="balance-card primary">
          <div className="card-icon">💳</div>
          <div className="card-content">
            <p className="card-label">R-Wallet Balance</p>
            <p className="card-amount">₹ {walletData.rWalletBalance.toFixed(2)}</p>
          </div>
        </div>

        <div className="balance-card secondary">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <p className="card-label">Total Earning</p>
            <p className="card-amount">₹ {walletData.totalEarning.toFixed(2)}</p>
          </div>
        </div>

        <div className="balance-card secondary">
          <div className="card-icon">🚀</div>
          <div className="card-content">
            <p className="card-label">Total Withdrawal</p>
            <p className="card-amount">₹ {walletData.totalWithdrawal.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="buyepin-single-flex">
        <div className="buyepin-single-left">
          <div className="withdrawal-amount-card">
            <h3 className="buyepin-section-title">Withdrawal Amount</h3>

            <div className="amount-input-section">
              <label className="amount-label">Enter Amount (₹)</label>
              <div className="input-wrapper">
                <span className="rupee-icon">₹</span>
                <input
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="Enter Amount"
                  className="amount-input"
                />
              </div>
            </div>

            {/* Quick Select Buttons */}
            <div className="quick-select-section">
              <div className="quick-btn" onClick={() => handleQuickSelect(1000)}>
                ₹1000
              </div>
              <div className="quick-btn" onClick={() => handleQuickSelect(2000)}>
                ₹2000
              </div>
              <div className="quick-btn" onClick={() => handleQuickSelect(5000)}>
                ₹5000
              </div>
            </div>

            {/* Withdrawal Summary */}
            <div className="withdrawal-summary">
              <h4 className="summary-title">Withdrawal Summary</h4>

              <div className="summary-row">
                <span className="summary-label">Withdrawal Amount</span>
                <span className="summary-value">
                  {withdrawalAmount ? parseFloat(withdrawalAmount).toFixed(2) : '0.00'}
                </span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Transaction fee</span>
                <span className="summary-value">- {transactionFee.toFixed(2)}</span>
              </div>

              <div className="summary-row highlight">
                <span className="summary-label bold">You Will Receive</span>
                <span className="summary-value bold">{youWillReceive.toFixed(2)}</span>
              </div>
            </div>

            {/* Password Fields */}
            <div className="password-field">
              <label className="password-label">Enter Transaction Password</label>
              <input
                type="password"
                value={transactionPassword}
                onChange={(e) => setTransactionPassword(e.target.value)}
                placeholder="Enter Transaction Password"
                className="password-input"
              />
            </div>

            <div className="password-field">
              <label className="password-label">Re-enter Transaction Password</label>
              <input
                type="password"
                value={reenterPassword}
                onChange={(e) => setReenterPassword(e.target.value)}
                placeholder="Re-enter Transaction Password"
                className="password-input"
              />
            </div>

            <button className="confirm-withdrawal-btn" onClick={handleConfirmWithdrawal} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Confirm Withdrawal'}
            </button>
          </div>
        </div>

        {/* Right Section - Transfer Method */}
        <div className="buyepin-single-right">
          <div className="transfer-method-card">
            <h3 className="buyepin-section-title">Transfer Method</h3>

            {/* Bank Transfer Option */}
            <div className="transfer-option">
              <label className="transfer-label">
                <input
                  type="radio"
                  name="transferMethod"
                  value="bank"
                  checked={selectedTransfer === 'bank'}
                  onChange={(e) => setSelectedTransfer(e.target.value)}
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

            {/* UPI Transfer Option */}
            <div className="transfer-option">
              <label className="transfer-label">
                <input
                  type="radio"
                  name="transferMethod"
                  value="upi"
                  checked={selectedTransfer === 'upi'}
                  onChange={(e) => setSelectedTransfer(e.target.value)}
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

            {/* Withdrawal Limit Note */}
            <div className="withdrawal-note">
              <p>
                <strong>Note:</strong> daily withdrawal limit minimum 1000.00 to maximum 10000.00
              </p>
            </div>

            {/* Bank Account Details */}
            <div className="bank-account-details" style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 className="details-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', marginBottom: '20px', color: '#00e5ff', borderBottom: '1px solid rgba(0, 229, 255, 0.2)', paddingBottom: '12px' }}>
                <i className="fa-solid fa-building-columns"></i>
                Bank Account Details
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <div style={{ color: '#a0aec0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Bank Name</div>
                  <div style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>{bankDetails.bankName}</div>
                </div>
                <div>
                  <div style={{ color: '#a0aec0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Branch</div>
                  <div style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>{bankDetails.branch}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: '#a0aec0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>A/c Holder Name</div>
                  <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>{bankDetails.accountHolder}</div>
                </div>
                <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: '#a0aec0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Account Number</div>
                  <div style={{ color: '#00e5ff', fontSize: '20px', fontWeight: '700', letterSpacing: '2px' }}>{bankDetails.accountNo}</div>
                </div>
                <div>
                  <div style={{ color: '#a0aec0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Account Type</div>
                  <div style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>{bankDetails.accountType}</div>
                </div>
                <div>
                  <div style={{ color: '#a0aec0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>IFSC Code</div>
                  <div style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>{bankDetails.ifscCode}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: '#a0aec0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>UPI ID</div>
                  <div style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>{bankDetails.upiId}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Withdraw;
