// BuyEPin.jsx
import './BuyEPin.css';
import { useEffect, useState } from 'react';
import { createEpinRequest, getBankAccount } from '../../../api/managementService';

function BuyEPin() {
  const [form, setForm] = useState({
    fullName: '',
    memberId: '',
    mobileNo: '',
    epinType: '',
    numberOfEpins: '',
    amountOfEpins: '',
    totalPaidAmount: '',
    paymentSlip: null,
  });

  const [bankAccount, setBankAccount] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await getBankAccount();
        setBankAccount(response.bankAccount || null);
      } catch (error) {
        setBankAccount(null);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createEpinRequest({
      clientId: form.memberId,
      name: form.fullName,
      packageCost: form.epinType || 'Activation-10.00',
      qty: form.numberOfEpins,
      paidAmount: form.totalPaidAmount,
      mobile: form.mobileNo,
    });
  };

  // Payment details organized in two logical groups
  const upiDetails = [
    { label: 'UPI ID', value: bankAccount?.upiId || 'NishaShirke@Oksbi' },
    { label: 'Google Pay No.', value: bankAccount?.googlePay || 'gp@example.com' },
    { label: 'PhonePe No.', value: bankAccount?.phonePe || 'phonepe@example.com' },
    { label: 'Paytm No.', value: bankAccount?.payTm || 'paytm@example.com' },
  ];

  const bankDetails = [
    { label: 'Bank Name', value: bankAccount?.bankName || 'State Bank of India' },
    { label: 'Bank Branch', value: bankAccount?.bankBranch || 'Main Branch, New Delhi' },
    { label: 'A/c Holder Name', value: bankAccount?.accountHolderName || 'Company Name Pvt Ltd' },
    { label: 'A/c No.', value: bankAccount?.accountNo || '123456789012' },
    { label: 'A/c Type', value: bankAccount?.accountType || 'Current Account' },
    { label: 'IFSC Code', value: bankAccount?.ifscCode || 'SBIN0012345' },
  ];

  return (
    <div className="buyepin-container">
      <h1 className="buyepin-title">Buy ePin</h1>
      <div className="buyepin-panel">
        <form className="buyepin-form-grid" onSubmit={handleSubmit}>
          <div className="buyepin-section buyepin-single-card">
            <div className="buyepin-single-flex">
              {/* Left: Scanner and Payment Tables */}
              <div className="buyepin-single-left">
                <h2 className="buyepin-section-title">Payment Details</h2>
                <div className="buyepin-scanner">
                  <div className="buyepin-scanner-content">
                    <svg className="buyepin-scanner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" />
                      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeLinecap="round" />
                      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
                    </svg>
                    <span className="buyepin-scanner-text">Scan QR Code</span>
                    <span className="buyepin-scanner-subtext">UPI / Payment Scanner</span>
                  </div>
                </div>
                <div className="buyepin-tables-wrapper">
                  <div className="buyepin-payment-table-card">
                    <h3 className="buyepin-table-heading">UPI Details</h3>
                    <div className="buyepin-responsive-table">
                      <table className="buyepin-table">
                        <tbody>
                          {upiDetails.map((detail, idx) => (
                            <tr key={`upi-${idx}`}>
                              <td className="buyepin-table-label">{detail.label}</td>
                              <td className="buyepin-table-value">{detail.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="buyepin-payment-table-card">
                    <h3 className="buyepin-table-heading">Bank Account Details</h3>
                    <div className="buyepin-responsive-table">
                      <table className="buyepin-table">
                        <tbody>
                          {bankDetails.map((detail, idx) => (
                            <tr key={`bank-${idx}`}>
                              <td className="buyepin-table-label">{detail.label}</td>
                              <td className="buyepin-table-value">{detail.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Form Fields */}
              <div className="buyepin-single-right">
                <h2 className="buyepin-section-title">Request ePins</h2>
                <div className="buyepin-form-fields">
                  <div className="buyepin-form-col">
                    <div className="buyepin-input-group">
                      <label>FULL NAME <span className="buyepin-required">*</span></label>
                      <input 
                        name="fullName" 
                        value={form.fullName} 
                        onChange={handleChange} 
                        type="text" 
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="buyepin-input-group">
                      <label>MEMBER ID <span className="buyepin-required">*</span></label>
                      <input 
                        name="memberId" 
                        value={form.memberId} 
                        onChange={handleChange} 
                        type="text" 
                        placeholder="Enter member ID"
                        required
                      />
                    </div>
                    <div className="buyepin-input-group">
                      <label>NUMBER OF ePins <span className="buyepin-required">*</span></label>
                      <input 
                        name="numberOfEpins" 
                        value={form.numberOfEpins} 
                        onChange={handleChange} 
                        type="number" 
                        placeholder="Quantity"
                        min="1"
                        required
                      />
                    </div>
                    <div className="buyepin-input-group">
                      <label>PAYMENT SLIP</label>
                      <div className="buyepin-file-input-wrapper">
                        <input 
                          name="paymentSlip" 
                          type="file" 
                          onChange={handleChange} 
                          accept="image/*,.pdf"
                          id="paymentSlip"
                        />
                        <label htmlFor="paymentSlip" className="buyepin-file-label">
                          {form.paymentSlip ? form.paymentSlip.name : 'Upload Payment Slip'}
                        </label>
                      </div>
                      <span className="buyepin-field-hint">Supported: JPG, PNG, PDF (Max 5MB)</span>
                    </div>
                  </div>
                  <div className="buyepin-form-col">
                    <div className="buyepin-input-group">
                      <label>MOBILE NO <span className="buyepin-required">*</span></label>
                      <input 
                        name="mobileNo" 
                        value={form.mobileNo} 
                        onChange={handleChange} 
                        type="tel" 
                        placeholder="Enter 10-digit mobile number"
                        required
                      />
                    </div>
                    <div className="buyepin-input-group">
                      <label>ePIN TYPE</label>
                      <select 
                        name="epinType" 
                        value={form.epinType} 
                        onChange={handleChange}
                        className="buyepin-select-input"
                      >
                        <option value="">Select ePin type</option>
                        <option value="basic">Basic ePin - ₹100</option>
                        <option value="standard">Standard ePin - ₹500</option>
                        <option value="premium">Premium ePin - ₹1000</option>
                        <option value="enterprise">Enterprise ePin - ₹5000</option>
                      </select>
                    </div>
                    <div className="buyepin-input-group">
                      <label>AMOUNT OF ePins (₹)</label>
                      <input 
                        name="amountOfEpins" 
                        value={form.amountOfEpins} 
                        onChange={handleChange} 
                        type="number" 
                        placeholder="Total amount before tax"
                        min="0"
                        step="1"
                      />
                    </div>
                    <div className="buyepin-input-group">
                      <label>TOTAL PAID AMOUNT (₹) <span className="buyepin-required">*</span></label>
                      <input 
                        name="totalPaidAmount" 
                        value={form.totalPaidAmount} 
                        onChange={handleChange} 
                        type="number" 
                        placeholder="Amount you paid"
                        min="0"
                        step="1"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="buyepin-btn-row">
                  <button className="buyepin-btn-blue" type="submit">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BuyEPin;