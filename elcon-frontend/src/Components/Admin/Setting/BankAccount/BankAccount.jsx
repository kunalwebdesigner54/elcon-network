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
    <div className="bank-page container">
      <h3 className="bank-header">Company Bank Account</h3>
      <div className="bank-card">
        <div className="bank-qr">
          <img src={qr} alt="qr" />
          <div className="upi">UPI ID : {bankAccount?.upiId || 'Elcon.network@oksbi'}</div>
        </div>

        <div className="bank-details">
          <div className="bd-title">Bank Account Details</div>
          <table className="bd-table">
            <tbody>
              <tr><td>Bank Name</td><td>{bankAccount?.bankName || 'State Bank Of India'}</td></tr>
              <tr><td>Bank Branch</td><td>{bankAccount?.bankBranch || 'Pashan Pune'}</td></tr>
              <tr><td>A/c Holder Name</td><td>{bankAccount?.accountHolderName || 'Elcon Network'}</td></tr>
              <tr><td>A/c No.</td><td>{bankAccount?.accountNo || '458578525894'}</td></tr>
              <tr><td>A/c Type</td><td>{bankAccount?.accountType || 'Current Account'}</td></tr>
              <tr><td>IFSC Code</td><td>{bankAccount?.ifscCode || 'SBIN004736'}</td></tr>
            </tbody>
          </table>

          <div className="bank-actions">
            <button className="btn-edit">EDIT</button>
            <button className="btn-update">UPDATE</button>
          </div>
        </div>
      </div>
    </div>
  )
}
