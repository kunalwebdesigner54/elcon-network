import React, { useState, useEffect } from 'react';
import './DonationVerificationModal.css';

/**
 * Reusable Donation Verification Modal
 * Shows a styled popup for UTR Number + Transaction Password + optional Remark
 * Used in both Admin and Member panels for donation approval
 *
 * Props:
 *   isOpen        {boolean}  - show/hide modal
 *   title         {string}   - modal title
 *   onSubmit      {function} - called with { utrNumber, transactionPassword, remark }
 *   onCancel      {function} - called when user cancels
 *   loading       {boolean}  - show loading state on submit button
 */
const DonationVerificationModal = ({ isOpen, title = 'DONATION VERIFICATION', onSubmit, onCancel, loading = false }) => {
  const [utrNumber, setUtrNumber] = useState('');
  const [transactionPassword, setTransactionPassword] = useState('');
  const [remark, setRemark] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // Reset fields when modal opens
  useEffect(() => {
    if (isOpen) {
      setUtrNumber('');
      setTransactionPassword('');
      setRemark('');
      setLocalError('');
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (!utrNumber.trim()) {
      setLocalError('UTR / Transaction ID required hai.');
      return;
    }
    if (!transactionPassword.trim()) {
      setLocalError('Transaction Password required hai.');
      return;
    }

    onSubmit({ utrNumber: utrNumber.trim(), transactionPassword: transactionPassword.trim(), remark: remark.trim() });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div className="dvmodal-backdrop" onClick={handleBackdropClick}>
      <div className="dvmodal-container" role="dialog" aria-modal="true" aria-labelledby="dvmodal-title">
        <div className="dvmodal-header">
          <span className="dvmodal-icon">🔐</span>
          <h2 className="dvmodal-title" id="dvmodal-title">{title}</h2>
        </div>

        <form className="dvmodal-form" onSubmit={handleSubmit} autoComplete="off">
          {localError && (
            <div className="dvmodal-error">
              <span>⚠ {localError}</span>
            </div>
          )}

          <div className="dvmodal-field">
            <label className="dvmodal-label" htmlFor="dvmodal-utr">ENTER UTR NUMBER TO VERIFY *</label>
            <input
              id="dvmodal-utr"
              className="dvmodal-input"
              type="text"
              placeholder="Enter UTR / Transaction ID"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="dvmodal-field">
            <label className="dvmodal-label" htmlFor="dvmodal-pass">ENTER TRANSACTION PASSWORD *</label>
            <div className="dvmodal-input-wrap">
              <input
                id="dvmodal-pass"
                className="dvmodal-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Transaction Password"
                value={transactionPassword}
                onChange={(e) => setTransactionPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="dvmodal-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className="dvmodal-field">
            <label className="dvmodal-label" htmlFor="dvmodal-remark">ENTER REMARK</label>
            <input
              id="dvmodal-remark"
              className="dvmodal-input"
              type="text"
              placeholder="Optional remark..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="dvmodal-actions">
            <button type="button" className="dvmodal-btn-cancel" onClick={onCancel} disabled={loading}>
              CANCEL
            </button>
            <button type="submit" className="dvmodal-btn-submit" disabled={loading}>
              {loading ? 'Verifying...' : 'SUBMIT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonationVerificationModal;
