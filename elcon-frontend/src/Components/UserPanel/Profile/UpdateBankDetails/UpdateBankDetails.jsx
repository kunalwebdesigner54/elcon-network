import '../../Common/UserLayout.css';
import './UpdateBankDetails.css';
import { useState, useEffect } from 'react';
import { getProfile, updateBankDetails } from '../../../../api/authService';

function UpdateBankDetails() {
  const [bankDetails, setBankDetails] = useState({
    accountNo: '',
    holderName: '',
    bankName: '',
    bankBranch: '',
    panNo: '',
    aadharNo: '',
    ifsc: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load bank details on mount
  useEffect(() => {
    const loadBankDetails = async () => {
      try {
        const response = await getProfile();
        if (response.success && response.data) {
          const { bankDetails: bd, aadharNo } = response.data;
          setBankDetails({
            accountNo: bd?.accountNo || '',
            holderName: bd?.holderName || '',
            bankName: bd?.bankName || '',
            bankBranch: bd?.bankBranch || '',
            panNo: bd?.panNo || '',
            aadharNo: aadharNo || '',
            ifsc: bd?.ifsc || '',
          });
        }
      } catch (err) {
        console.error('Error loading bank details:', err);
        setError('Failed to load bank details');
      } finally {
        setLoading(false);
      }
    };

    loadBankDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const { aadharNo, ...bankData } = bankDetails;
      await updateBankDetails(bankData);
      setMessage('Bank details updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update bank details');
      console.error('Error updating bank details:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setMessage('');
    setError('');
  };

  if (loading) {
    return (
      <div>
        <h1 className="user-page-title">Edit Bank A/C</h1>
        <div className="user-panel">
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="user-page-title">Edit Bank A/C</h1>
      <div className="user-panel">
        {message && <div style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>{message}</div>}
        {error && <div style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>Account No.</label>
            <input
              name="accountNo"
              value={bankDetails.accountNo}
              onChange={handleChange}
              placeholder="Enter account number"
            />
            <label>Holder Name</label>
            <input
              name="holderName"
              value={bankDetails.holderName}
              onChange={handleChange}
              placeholder="Enter account holder name"
            />
            <label>Bank Name</label>
            <input
              name="bankName"
              value={bankDetails.bankName}
              onChange={handleChange}
              placeholder="Enter bank name"
            />
            <label>Bank Branch</label>
            <input
              name="bankBranch"
              value={bankDetails.bankBranch}
              onChange={handleChange}
              placeholder="Enter bank branch"
            />
            <label>PAN Number</label>
            <input
              name="panNo"
              value={bankDetails.panNo}
              onChange={handleChange}
              placeholder="Enter PAN number"
            />
            <label>ADHAR Number</label>
            <input
              name="aadharNo"
              value={bankDetails.aadharNo}
              onChange={handleChange}
              disabled
              placeholder="Aadhar number"
            />
            <label>IFSC Code</label>
            <input
              name="ifsc"
              value={bankDetails.ifsc}
              onChange={handleChange}
              placeholder="Enter IFSC code"
            />
          </div>
          <div className="btn-row">
            <button type="submit" className="user-btn-blue" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update'}
            </button>
            <button type="button" className="user-btn-muted" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateBankDetails;
