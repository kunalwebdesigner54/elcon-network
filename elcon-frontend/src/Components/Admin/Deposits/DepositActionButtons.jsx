import { useState } from 'react';
import { updateDepositRequestStatus } from '../../../api/paymentService';

const actionButtons = [
  {
    className: 'withdrawal-action-btn withdrawal-action-btn--approve',
    label: 'Approve',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <polyline points="9 15 11 17 15 13"></polyline>
      </svg>
    )
  },
  {
    className: 'withdrawal-action-btn withdrawal-action-btn--reject',
    label: 'Reject',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    )
  }
];

export default function DepositActionButtons({ depositId, utrNumber, reloadRows }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [adminTransactionId, setAdminTransactionId] = useState('');
  const [transactionPassword, setTransactionPassword] = useState('');
  const [remark, setRemark] = useState('');
  const [processing, setProcessing] = useState(false);

  const updateStatus = async (nextStatus, confirmation = {}) => {
    setProcessing(true);
    try {
      await updateDepositRequestStatus(depositId, {
        status: nextStatus,
        ...confirmation,
      });
      await reloadRows();
      setShowConfirmModal(false);
      setAdminTransactionId('');
      setTransactionPassword('');
      setRemark('');
    } catch (error) {
      window.alert(error?.response?.data?.message || 'Unable to update deposit status');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="withdrawal-action-group" aria-label="Deposit actions">
        {actionButtons.map((button) => (
          <button
            key={button.label}
            type="button"
            className={button.className}
            aria-label={button.label}
            title={button.label}
            disabled={processing}
            onClick={() => {
              const nextStatus = button.label === 'Reject' ? 'Rejected' : button.label;
              if (nextStatus === 'Succeed') {
                setShowConfirmModal(true);
              } else {
                updateStatus(nextStatus);
              }
            }}
          >
            {button.icon}
          </button>
        ))}
      </div>
      {showConfirmModal && (
        <div className="deposit-confirm-backdrop" role="presentation" onClick={() => !processing && setShowConfirmModal(false)}>
          <div className="deposit-confirm-modal" role="dialog" aria-modal="true" aria-labelledby={`deposit-confirm-title-${depositId}`} onClick={(event) => event.stopPropagation()}>
            <h3 id={`deposit-confirm-title-${depositId}`}>DEPOSIT RE-VERIFICATION</h3>
            <label htmlFor={`admin-transaction-id-${depositId}`}>ENTER UTR NUMBER TO VERIFY*</label>
            <input id={`admin-transaction-id-${depositId}`} type="text" value={adminTransactionId} onChange={(event) => setAdminTransactionId(event.target.value)} placeholder="Enter bank transaction ID" autoFocus disabled={processing} />
            <label htmlFor={`transaction-password-${depositId}`}>ENTER ADMIN TRANS. PASSWORD*</label>
            <input id={`transaction-password-${depositId}`} type="password" value={transactionPassword} onChange={(event) => setTransactionPassword(event.target.value)} placeholder="Enter transaction password" disabled={processing} />
            <label htmlFor={`remark-${depositId}`}>ENTER REMARK</label>
            <input id={`remark-${depositId}`} type="text" value={remark} onChange={(event) => setRemark(event.target.value)} placeholder="Enter remark" disabled={processing} />
            <div className="deposit-confirm-actions">
              <button type="button" className="deposit-confirm-cancel" onClick={() => setShowConfirmModal(false)} disabled={processing}>Cancel</button>
              <button type="button" className="deposit-confirm-submit" disabled={processing || !adminTransactionId.trim() || !transactionPassword} onClick={() => {
                if (adminTransactionId.trim().toUpperCase() !== String(utrNumber || '').trim().toUpperCase()) {
                  window.alert('Entered UTR number does not match the actual UTR number.');
                  return;
                }
                updateStatus('Succeed', { adminTransactionId: adminTransactionId.trim(), transactionPassword, remark });
              }}>
                {processing ? 'SUBMITTING...' : 'SUBMIT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
