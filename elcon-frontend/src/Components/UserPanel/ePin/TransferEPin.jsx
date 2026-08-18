import { useEffect, useMemo, useState } from 'react';
import { getEpinList, transferEpin } from '../../../api/managementService';

export default function TransferEPin() {
  const [epins, setEpins] = useState([]);
  const [selectedEpin, setSelectedEpin] = useState('');
  const [toMember, setToMember] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const response = await getEpinList({ status: 'Unused' });
        setEpins(response.epins || []);
      } catch (err) {
        setEpins([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedRecord = useMemo(() => epins.find((item) => item.epin === selectedEpin), [epins, selectedEpin]);

  useEffect(() => {
    if (selectedRecord && !amount) {
      setAmount(String(selectedRecord.cost || ''));
    }
  }, [selectedRecord, amount]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!selectedEpin || !toMember.trim()) {
      setError('Select an ePin and enter a recipient member id.');
      return;
    }

    setSubmitting(true);
    try {
      await transferEpin(selectedEpin, {
        toMember: toMember.trim(),
        amount: amount ? Number(amount) : selectedRecord?.cost,
      });
      setMessage('ePin transferred successfully.');
      setSelectedEpin('');
      setToMember('');
      setAmount('');
      const response = await getEpinList({ status: 'Unused' });
      setEpins(response.epins || []);
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
            <select aria-label="Select ePin" value={selectedEpin} onChange={(event) => setSelectedEpin(event.target.value)} disabled={loading || submitting}>
              <option value="">{loading ? 'Loading ePins...' : 'Select ePin'}</option>
              {epins.map((epin) => (
                <option key={epin.epin} value={epin.epin}>
                  {epin.epin} - {epin.epinName}
                </option>
              ))}
            </select>
            <input type="text" placeholder="RECIPIENT MEMBER ID" aria-label="Recipient Member ID" value={toMember} onChange={(event) => setToMember(event.target.value)} disabled={submitting} />
            <input type="number" placeholder="AMOUNT" aria-label="Amount" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={submitting} />
            <button className="user-btn-blue" type="submit" disabled={submitting || loading}>{submitting ? 'TRANSFER...' : 'TRANSFER'}</button>
          </div>
        </form>

        {message ? <p style={{ color: '#166534', marginTop: 12 }}>{message}</p> : null}
        {error ? <p style={{ color: '#b91c1c', marginTop: 12 }}>{error}</p> : null}
      </div>
    </div>
  );
}
