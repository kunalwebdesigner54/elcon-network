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
    if (!withdrawalAmount || parseFloat(withdrawalAmount) === 0) {
      alert('Please enter a withdrawal amount');
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
    <div className="withdraw-wrapper">
      <div className="withdraw-header">
        <h2>Withdraw</h2>
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

      <div className="withdraw-container">
        {/* Left Section - Withdrawal Amount */}
        <div className="withdraw-left">
          <div className="withdrawal-amount-card">
            <h3 className="card-title">Withdrawal Amount</h3>

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
        <div className="withdraw-right">
          <div className="transfer-method-card">
            <h3 className="card-title">Transfer Method</h3>

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
            <div className="bank-account-details">
              <h4 className="details-title">Bank Account Details</h4>
              <table className="details-table">
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
                  <tr className="upi-row">
                    <td className="detail-label">UPI ID :</td>
                    <td className="detail-value">{bankDetails.upiId}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
