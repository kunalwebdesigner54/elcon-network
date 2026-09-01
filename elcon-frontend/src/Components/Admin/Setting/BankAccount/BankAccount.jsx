import { useEffect, useState } from 'react';
import './BankAccount.css';
import qr from '../../../../Assets/Pictures/QR-Code.png';
import { getBankAccount, updateBankAccount } from '../../../../api/managementService';
import Swal from 'sweetalert2';
export default function BankAccount(){
  const [bankAccount, setBankAccount] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    bankBranch: '',
    accountHolderName: '',
    accountNo: '',
    accountType: '',
    ifscCode: '',
    upiId: '',
    qrCodeBase64: ''
  });

  useEffect(() => {
    (async () => {
      try {
        const response = await getBankAccount();
        if (response.bankAccount) {
          setBankAccount(response.bankAccount);
          setFormData({
            bankName: response.bankAccount.bankName || '',
            bankBranch: response.bankAccount.bankBranch || '',
            accountHolderName: response.bankAccount.accountHolderName || '',
            accountNo: response.bankAccount.accountNo || '',
            accountType: response.bankAccount.accountType || '',
            ifscCode: response.bankAccount.ifscCode || '',
            upiId: response.bankAccount.upiId || '',
            qrCodeBase64: response.bankAccount.qrCodeBase64 || ''
          });
        }
      } catch (error) {
        console.error("Error fetching bank account", error);
      }
    })();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, qrCodeBase64: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await updateBankAccount(formData);
      if (res.success) {
        Swal.fire("Success", "Bank account updated successfully!", "success");
        setBankAccount(res.bankAccount);
        setIsEditing(false);
      } else {
        Swal.fire("Error", res.message || "Update failed", "error");
      }
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "An error occurred", "error");
    }
  };

  return (
    <div className="buyepin-container" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="buyepin-title" style={{ margin: 0, paddingLeft: 0, borderLeft: 'none' }}>Company Bank Account</h1>
      </div>

      <div className="buyepin-single-card" style={{ flexGrow: 1, padding: '36px 32px' }}>
        <div className="buyepin-single-flex" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          
          {/* Left Side - QR Code */}
          <div className="buyepin-single-left" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '20px', position: 'relative' }}>
              <img src={formData.qrCodeBase64 || bankAccount?.qrCodeBase64 || qr} alt="UPI QR code" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
              {isEditing && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <label htmlFor="qr-upload" style={{ cursor: 'pointer', color: '#00e5ff', fontSize: '14px', fontWeight: '600' }}>Upload New QR</label>
                  <input id="qr-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0, 229, 255, 0.1)', padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
              <span style={{ color: '#a0aec0', fontSize: '14px', fontWeight: '500' }}>UPI ID :</span>
              {isEditing ? (
                 <input type="text" name="upiId" value={formData.upiId} onChange={handleChange} style={{ background: 'transparent', border: 'none', color: '#00e5ff', fontSize: '16px', fontWeight: '700', letterSpacing: '1px', borderBottom: '1px solid #00e5ff', outline: 'none' }} />
              ) : (
                <span style={{ color: '#00e5ff', fontSize: '16px', fontWeight: '700', letterSpacing: '1px' }}>{bankAccount?.upiId || 'Elcon.network@oksbi'}</span>
              )}
            </div>
          </div>

          {/* Right Side - Bank Details */}
          <div className="buyepin-single-right" style={{ flex: '2 1 400px' }}>
            <div style={{ padding: '30px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', marginBottom: '30px', color: '#00e5ff', borderBottom: '1px solid rgba(0, 229, 255, 0.2)', paddingBottom: '12px', margin: '0 0 24px 0' }}>
                <i className="fa-solid fa-building-columns"></i>
                Bank Account Details
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <div style={{ color: '#a0aec0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>Bank Name</div>
                  {isEditing ? (
                    <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="form-control" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '4px', width: '100%' }} />
                  ) : (
                    <div style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>{bankAccount?.bankName || 'State Bank Of India'}</div>
                  )}
                </div>
                <div>
                  <div style={{ color: '#a0aec0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>Branch</div>
                  {isEditing ? (
                    <input type="text" name="bankBranch" value={formData.bankBranch} onChange={handleChange} className="form-control" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '4px', width: '100%' }} />
                  ) : (
                    <div style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>{bankAccount?.bankBranch || 'Pashan Pune'}</div>
                  )}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: '#a0aec0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>A/c Holder Name</div>
                  {isEditing ? (
                    <input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} className="form-control" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '4px', width: '100%' }} />
                  ) : (
                    <div style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>{bankAccount?.accountHolderName || 'Elcon Network'}</div>
                  )}
                </div>
                <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: '#a0aec0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>Account Number</div>
                  {isEditing ? (
                    <input type="text" name="accountNo" value={formData.accountNo} onChange={handleChange} className="form-control" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0, 229, 255, 0.5)', color: '#00e5ff', padding: '8px 12px', borderRadius: '4px', width: '100%', fontSize: '18px', fontWeight: 'bold' }} />
                  ) : (
                    <div style={{ color: '#00e5ff', fontSize: '24px', fontWeight: '700', letterSpacing: '2px' }}>{bankAccount?.accountNo || '458578525894'}</div>
                  )}
                </div>
                <div>
                  <div style={{ color: '#a0aec0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>Account Type</div>
                  {isEditing ? (
                    <input type="text" name="accountType" value={formData.accountType} onChange={handleChange} className="form-control" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '4px', width: '100%' }} />
                  ) : (
                    <div style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>{bankAccount?.accountType || 'Current Account'}</div>
                  )}
                </div>
                <div>
                  <div style={{ color: '#a0aec0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>IFSC Code</div>
                  {isEditing ? (
                    <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} className="form-control" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '4px', width: '100%' }} />
                  ) : (
                    <div style={{ color: '#fff', fontSize: '16px', fontWeight: '500', letterSpacing: '1px' }}>{bankAccount?.ifscCode || 'SBIN004736'}</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '40px', justifyContent: 'flex-end' }}>
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="buyepin-btn-blue" style={{ padding: '10px 24px', minWidth: '120px', background: 'transparent', border: '1px solid #dc3545', color: '#dc3545' }}>CANCEL</button>
                    <button onClick={handleUpdate} className="buyepin-btn-blue" style={{ padding: '10px 24px', minWidth: '120px' }}>SAVE CHANGES</button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="buyepin-btn-blue" style={{ padding: '10px 24px', minWidth: '120px', background: 'transparent', border: '1px solid #00e5ff', color: '#00e5ff' }}>EDIT</button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
