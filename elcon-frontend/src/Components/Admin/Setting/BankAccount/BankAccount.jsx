import { useEffect, useState } from 'react';
import './BankAccount.css';
import qr from '../../../../Assets/Pictures/QR-Code.png';
import { getBankAccount } from '../../../../api/managementService';

export default function BankAccount(){
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

  return (
    <div className="buyepin-container" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="buyepin-title" style={{ margin: 0, paddingLeft: 0, borderLeft: 'none' }}>Company Bank Account</h1>
      </div>

      <div className="buyepin-single-card" style={{ flexGrow: 1, padding: '36px 32px' }}>
        <div className="buyepin-single-flex" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          
          {/* Left Side - QR Code */}
          <div className="buyepin-single-left" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
              <img src={qr} alt="UPI QR code" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0, 229, 255, 0.1)', padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
              <span style={{ color: '#a0aec0', fontSize: '14px', fontWeight: '500' }}>UPI ID :</span>
              <span style={{ color: '#00e5ff', fontSize: '16px', fontWeight: '700', letterSpacing: '1px' }}>{bankAccount?.upiId || 'Elcon.network@oksbi'}</span>
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
                  <div style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>{bankAccount?.bankName || 'State Bank Of India'}</div>
                </div>
                <div>
                  <div style={{ color: '#a0aec0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>Branch</div>
                  <div style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>{bankAccount?.bankBranch || 'Pashan Pune'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: '#a0aec0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>A/c Holder Name</div>
                  <div style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>{bankAccount?.accountHolderName || 'Elcon Network'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: '#a0aec0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>Account Number</div>
                  <div style={{ color: '#00e5ff', fontSize: '24px', fontWeight: '700', letterSpacing: '2px' }}>{bankAccount?.accountNo || '458578525894'}</div>
                </div>
                <div>
                  <div style={{ color: '#a0aec0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>Account Type</div>
                  <div style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>{bankAccount?.accountType || 'Current Account'}</div>
                </div>
                <div>
                  <div style={{ color: '#a0aec0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>IFSC Code</div>
                  <div style={{ color: '#fff', fontSize: '16px', fontWeight: '500', letterSpacing: '1px' }}>{bankAccount?.ifscCode || 'SBIN004736'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '40px', justifyContent: 'flex-end' }}>
                <button className="buyepin-btn-blue" style={{ padding: '10px 24px', minWidth: '120px', background: 'transparent', border: '1px solid #00e5ff', color: '#00e5ff' }}>EDIT</button>
                <button className="buyepin-btn-blue" style={{ padding: '10px 24px', minWidth: '120px' }}>UPDATE</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
