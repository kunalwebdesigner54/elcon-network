import { useEffect, useState } from 'react';
import { getEpinList, transferEpins } from '../../../api/managementService';

export default function TransferEPin() {
  const [epins, setEpins] = useState([]);
  const [selectedEpins, setSelectedEpins] = useState([]);
  const [toMember, setToMember] = useState('');
  const [transactionPassword, setTransactionPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadEpins = async () => {
    const response = await getEpinList({ status: 'Unused' });
    setEpins(response.epins || []);
  };

  useEffect(() => {
    loadEpins().catch(() => setError('Unable to load available ePins.')).finally(() => setLoading(false));
  }, []);

  const toggleEpin = (epinNo) => {
    setSelectedEpins((current) => current.includes(epinNo)
      ? current.filter((value) => value !== epinNo)
      : [...current, epinNo]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!selectedEpins.length || !toMember.trim() || !transactionPassword) {
      setError('Select one or more ePins, enter recipient member id and transaction password.');
      return;
    }
    setSubmitting(true);
    try {
      await transferEpins(selectedEpins, { toMember: toMember.trim(), transactionPassword });
      setMessage(`${selectedEpins.length} ePin(s) transferred successfully.`);
      setSelectedEpins([]);
      setToMember('');
      setTransactionPassword('');
      await loadEpins();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Transfer failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="user-page-title">Transfer ePin</h1>
      <div className="user-panel">
        <form onSubmit={handleSubmit}>
          <div className="report-filters">
            <input type="text" placeholder="RECIPIENT MEMBER ID" aria-label="Recipient Member ID" value={toMember} onChange={(event) => setToMember(event.target.value)} disabled={submitting} />
            <input type="password" placeholder="TRANSACTION PASSWORD" aria-label="Transaction Password" value={transactionPassword} onChange={(event) => setTransactionPassword(event.target.value)} disabled={submitting} required />
          </div>
          <p>Select ePins ({selectedEpins.length} selected)</p>
          <div className="epin-selection-list">
            {loading ? <p>Loading ePins...</p> : epins.length ? epins.map((epin) => (
              <label key={epin.epin} className="epin-selection-item">
                <input type="checkbox" checked={selectedEpins.includes(epin.epin)} onChange={() => toggleEpin(epin.epin)} disabled={submitting} />
                <span>{epin.epin} - {epin.epinName} (₹{epin.cost})</span>
              </label>
            )) : <p>No unused ePins available.</p>}
          </div>
          <button className="user-btn-blue" type="submit" disabled={submitting || loading || !selectedEpins.length}>{submitting ? 'TRANSFER...' : `TRANSFER ${selectedEpins.length || ''}`}</button>
        </form>
        {message ? <p style={{ color: '#166534', marginTop: 12 }}>{message}</p> : null}
        {error ? <p style={{ color: '#b91c1c', marginTop: 12 }}>{error}</p> : null}
      </div>
    </div>
  );
}
