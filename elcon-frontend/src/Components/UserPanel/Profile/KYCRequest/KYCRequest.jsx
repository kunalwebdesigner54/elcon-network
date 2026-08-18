import { useEffect, useState } from 'react';
import './KYCRequest.css';
import { getProfile } from '../../../../api/authService';
import { submitKycRequest } from '../../../../api/membersService';

const initialFormData = {
  bankName: '',
  bankBranch: '',
  accountHolderName: '',
  bankAccountNumber: '',
  ifscCode: '',
  googlePayNumber: '',
  phonePeNumber: '',
  paytmNumber: '',
  upiId: '',
  aadharCardNumber: '',
  panNo: ''
};

function KYCRequest() {
  const [formData, setFormData] = useState(initialFormData);
  const [aadharFrontImage, setAadharFrontImage] = useState('');
  const [aadharBackImage, setAadharBackImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getProfile();
        const data = response.data || {};

        setFormData({
          bankName: data.bankDetails?.bankName || '',
          bankBranch: data.bankDetails?.bankBranch || '',
          accountHolderName: data.bankDetails?.holderName || '',
          bankAccountNumber: data.bankDetails?.accountNo || '',
          ifscCode: data.bankDetails?.ifsc || '',
          googlePayNumber: data.paymentDetails?.googlePay || '',
          phonePeNumber: data.paymentDetails?.phonePe || '',
          paytmNumber: data.paymentDetails?.payTm || '',
          upiId: data.paymentDetails?.upiId || '',
          aadharCardNumber: data.aadharNo || '',
          panNo: data.panNo || '',
        });
      } catch (error) {
        // Keep the form editable even when profile preload fails.
      }
    };

    loadProfile();
  }, []);

  const handleChange = (key) => (event) => {
    setFormData((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleFileChange = (setter) => (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setter('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setter(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    try {
      await submitKycRequest({
        ...formData,
        aadharFrontImage,
        aadharBackImage,
      });

      alert('KYC request submitted successfully');
    } catch (error) {
      alert(error?.response?.data?.message || 'Unable to submit KYC request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="panel" style={{ borderRadius: '28px', padding: '24px' }}>
        <div className="kyc-request-wrap">
          <h2 className="kyc-request-title">KYC Verification</h2>

          <form className="kyc-request-form" onSubmit={handleSubmit}>
            <label className="kyc-label" htmlFor="bankName">Bank Name</label>
            <input
              id="bankName"
              className="text-input"
              placeholder="Enter Bank Name"
              value={formData.bankName}
              onChange={handleChange('bankName')}
            />

            <label className="kyc-label" htmlFor="bankBranch">Bank Branch</label>
            <input
              id="bankBranch"
              className="text-input"
              placeholder="Enter Branch Name"
              value={formData.bankBranch}
              onChange={handleChange('bankBranch')}
            />

            <label className="kyc-label" htmlFor="accountHolderName">Account Holder Name</label>
            <input
              id="accountHolderName"
              className="text-input"
              placeholder="Enter Account Holder Name"
              value={formData.accountHolderName}
              onChange={handleChange('accountHolderName')}
            />

            <label className="kyc-label" htmlFor="bankAccountNumber">Bank Account Number</label>
            <input
              id="bankAccountNumber"
              className="text-input"
              placeholder="Enter Account Number"
              value={formData.bankAccountNumber}
              onChange={handleChange('bankAccountNumber')}
            />

            <label className="kyc-label" htmlFor="ifscCode">IFSC Code</label>
            <input
              id="ifscCode"
              className="text-input"
              placeholder="Enter IFSC Code"
              value={formData.ifscCode}
              onChange={handleChange('ifscCode')}
            />

            <div className="kyc-row-two-col">
              <div className="kyc-col">
                <label className="kyc-label" htmlFor="googlePayNumber">Google Pay Number</label>
                <input
                  id="googlePayNumber"
                  className="text-input"
                  placeholder="Enter Google Pay Number"
                  value={formData.googlePayNumber}
                  onChange={handleChange('googlePayNumber')}
                />
              </div>

              <div className="kyc-col">
                <label className="kyc-label" htmlFor="phonePeNumber">PhonePe Number</label>
                <input
                  id="phonePeNumber"
                  className="text-input"
                  placeholder="Enter PhonePe Number"
                  value={formData.phonePeNumber}
                  onChange={handleChange('phonePeNumber')}
                />
              </div>
            </div>

            <div className="kyc-row-two-col">
              <div className="kyc-col">
                <label className="kyc-label" htmlFor="paytmNumber">Paytm Number</label>
                <input
                  id="paytmNumber"
                  className="text-input"
                  placeholder="Enter Paytm Number"
                  value={formData.paytmNumber}
                  onChange={handleChange('paytmNumber')}
                />
              </div>

              <div className="kyc-col">
                <label className="kyc-label" htmlFor="upiId">UPI ID</label>
                <input
                  id="upiId"
                  className="text-input"
                  placeholder="Enter UPI ID"
                  value={formData.upiId}
                  onChange={handleChange('upiId')}
                />
              </div>
            </div>

            <div className="kyc-row-two-col">
              <div className="kyc-col">
                <label className="kyc-label" htmlFor="aadharCardNumber">Aadhar Card Number</label>
                <input
                  id="aadharCardNumber"
                  className="text-input"
                  placeholder="Enter Aadhar Card Number"
                  value={formData.aadharCardNumber}
                  onChange={handleChange('aadharCardNumber')}
                />
              </div>

              <div className="kyc-col">
                <label className="kyc-label" htmlFor="panNo">PAN No</label>
                <input
                  id="panNo"
                  className="text-input"
                  type="text"
                  placeholder="Enter PAN number"
                  value={formData.panNo}
                  onChange={handleChange('panNo')}
                />
              </div>
            </div>

            <label className="kyc-label" htmlFor="aadharFrontImage">Aadhar Card Front Image</label>
            <input id="aadharFrontImage" className="kyc-file-input" type="file" onChange={handleFileChange(setAadharFrontImage)} />

            <label className="kyc-label" htmlFor="aadharBackImage">Aadhar Card Back Image</label>
            <input id="aadharBackImage" className="kyc-file-input" type="file" onChange={handleFileChange(setAadharBackImage)} />

            <div className="kyc-submit-row">
              <button className="btn-primary kyc-submit-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit KYC'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default KYCRequest;
