import { useEffect, useState, useMemo } from 'react';
import { getEpinList, transferEpins } from '../../../api/managementService';
import { getSponsorDetails } from '../../../api/authService';
import Swal from 'sweetalert2';
import './GenerateEPin.css';

export default function TransferEPin() {
  const [epins, setEpins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedPackage, setSelectedPackage] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [toMember, setToMember] = useState('');
  const [transactionPassword, setTransactionPassword] = useState('');

  // Member Name checking state
  const [memberName, setMemberName] = useState('');
  const [memberNameLoading, setMemberNameLoading] = useState(false);
  const [memberNameError, setMemberNameError] = useState('');

  const loadEpins = async () => {
    try {
      const response = await getEpinList({ status: 'Unused' });
      setEpins(response.epins || []);
    } catch (err) {
      Swal.fire('Error', 'Unable to load available ePins.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEpins();
  }, []);

  // Group epins by package name
  const packageStats = useMemo(() => {
    const stats = {};
    epins.forEach(epin => {
      const name = epin.epinName || 'Unknown Package';
      if (!stats[name]) {
        stats[name] = { count: 0, cost: epin.cost, epins: [] };
      }
      stats[name].count += 1;
      stats[name].epins.push(epin.epin);
    });
    return stats;
  }, [epins]);

  // Recipient Name Fetcher
  useEffect(() => {
    const fetchName = async () => {
      if (!toMember || toMember.trim().toUpperCase() === 'ADMIN') {
        setMemberName(toMember.trim().toUpperCase() === 'ADMIN' ? 'Administrator' : '');
        setMemberNameError('');
        return;
      }
      setMemberNameLoading(true);
      setMemberNameError('');
      try {
        const response = await getSponsorDetails(toMember.trim());
        if (response.success && response.data?.name) {
          setMemberName(response.data.name);
        } else {
          setMemberNameError('Invalid ID or Member not found');
          setMemberName('');
        }
      } catch (err) {
        setMemberNameError('Invalid ID or Member not found');
        setMemberName('');
      } finally {
        setMemberNameLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchName();
    }, 500);

    return () => clearTimeout(timer);
  }, [toMember]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedPackage) {
      return Swal.fire('Error', 'Please select an ePin Package.', 'error');
    }
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      return Swal.fire('Error', 'Please enter a valid quantity.', 'error');
    }
    
    const availableEpins = packageStats[selectedPackage]?.epins || [];
    if (qty > availableEpins.length) {
      return Swal.fire('Error', `Only ${availableEpins.length} ePins available for selected package.`, 'error');
    }

    if (!toMember.trim() || !transactionPassword) {
      return Swal.fire('Error', 'Please enter recipient member id and transaction password.', 'error');
    }

    // Select the required number of E-Pins
    const epinsToTransfer = availableEpins.slice(0, qty);

    setSubmitting(true);
    try {
      await transferEpins(epinsToTransfer, { toMember: toMember.trim(), transactionPassword });
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `${qty} ePin(s) transferred successfully.`,
        confirmButtonColor: '#10b981'
      });
      
      setQuantity('1');
      setToMember('');
      setTransactionPassword('');
      setSelectedPackage('');
      await loadEpins();
    } catch (err) {
      Swal.fire('Error', err?.response?.data?.message || err.message || 'Transfer failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="buyepin-container" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh' }}>
      <h1 className="buyepin-title">Transfer ePin</h1>
      <div className="ge-wallet-section" style={{ flexGrow: 1 }}>
        
        {loading ? (
          <p style={{ color: '#fff' }}>Loading unused ePins...</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div className="buyepin-input-group">
              <label>Select Package <span className="buyepin-required">*</span></label>
              <select 
                value={selectedPackage} 
                onChange={(e) => setSelectedPackage(e.target.value)} 
                required
                style={{ backgroundColor: 'var(--bg-input, #0b131a)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '6px' }}
              >
                <option value="">-- Select Package --</option>
                {Object.keys(packageStats).map(pkg => (
                  <option key={pkg} value={pkg}>
                    {pkg} (Available: {packageStats[pkg].count})
                  </option>
                ))}
              </select>
            </div>

            <div className="buyepin-input-group">
              <label>Quantity to Transfer <span className="buyepin-required">*</span></label>
              <input 
                type="number" 
                min="1" 
                max={selectedPackage ? packageStats[selectedPackage]?.count : 9999}
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                required 
              />
            </div>

            <div className="buyepin-input-group">
              <label>Recipient Member ID <span className="buyepin-required">*</span></label>
              <input 
                type="text" 
                value={toMember} 
                onChange={(e) => setToMember(e.target.value.toUpperCase())} 
                required 
                placeholder="Enter Recipient Member ID"
              />
              <div style={{ marginTop: '5px', fontSize: '13px', fontWeight: 'bold' }}>
                {memberNameLoading && <span style={{ color: '#888' }}>Fetching name...</span>}
                {!memberNameLoading && memberNameError && <span style={{ color: '#ef4444' }}>{memberNameError}</span>}
                {!memberNameLoading && memberName && <span style={{ color: '#10b981', padding: '2px 8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px' }}>{memberName}</span>}
              </div>
            </div>

            <div className="buyepin-input-group">
              <label>Transaction Password <span className="buyepin-required">*</span></label>
              <input 
                type="password" 
                value={transactionPassword} 
                onChange={(e) => setTransactionPassword(e.target.value)} 
                required 
                placeholder="Enter Transaction Password"
              />
            </div>

            <div style={{ paddingTop: '8px' }}>
              <button 
                className="buyepin-btn-blue" 
                type="submit" 
                disabled={submitting || Object.keys(packageStats).length === 0}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {submitting ? 'PROCESSING TRANSFER...' : 'TRANSFER E-PINS'}
              </button>
            </div>
            
            {Object.keys(packageStats).length === 0 && (
              <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '10px' }}>
                You do not have any unused ePins to transfer.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
