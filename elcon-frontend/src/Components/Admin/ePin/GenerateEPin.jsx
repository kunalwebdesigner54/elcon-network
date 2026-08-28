import { useMemo, useState } from "react";
import './GenerateEPin.css';
import { generateEpins } from '../../../api/managementService';
import { getUser } from '../../../utils/auth';

function GenerateEPin() {
  const defaultGeneratedBy = useMemo(() => {
    try {
      const storedUser = getUser() || {};
      return storedUser.memberId || storedUser.epin || storedUser.id || 'ADMIN';
    } catch (error) {
      return 'ADMIN';
    }
  }, []);

  const [form, setForm] = useState({ epinName: 'Activation', generatedBy: defaultGeneratedBy, qty: '1', cost: '10' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    
    if (!form.epinName || form.epinName === 'ePin Name') {
      setError('Please select a valid ePin Name');
      return;
    }
    if (!form.generatedBy || !form.generatedBy.trim()) {
      setError('Please enter a Client ID');
      return;
    }
    if (!form.cost || Number(form.cost) <= 0) {
      setError('Please enter a valid amount/cost greater than 0');
      return;
    }
    if (!form.qty || Number(form.qty) <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      await generateEpins({ epinName: form.epinName, generatedBy: form.generatedBy, qty: form.qty, cost: form.cost });
      setMessage(`Successfully generated ${form.qty} ePin(s)`);
      setForm({ epinName: 'Activation', generatedBy: defaultGeneratedBy, qty: '1', cost: '10' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate ePins');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Generate ePin</h1>

      <div className="panel">
        <div className="epin-header-row">
          <h2 className="epin-title">Generate ePin</h2>
        </div>
        
        {message && <div style={{ color: 'green', marginBottom: '10px' }}>{message}</div>}
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <form className="epin-generate-grid" onSubmit={handleSubmit}>
          <label className="field-label">Type</label>
          <select className="select-input" name="epinName" value={form.epinName} onChange={handleChange}>
            <option>ePin Name</option>
            <option>Activation</option>
          </select>

          <label className="field-label">Client ID</label>
          <input className="text-input" placeholder="Client ID" name="generatedBy" value={form.generatedBy} onChange={handleChange} />

          <label className="field-label">Amount / Cost</label>
          <input className="text-input" type="number" min="1" placeholder="Amount / Cost" name="cost" value={form.cost} onChange={handleChange} />

          <label className="field-label">Required no.of ePin</label>
          <input className="text-input" type="number" min="1" placeholder="Required no.of ePin" name="qty" value={form.qty} onChange={handleChange} />

          <div className="epin-generate-actions" style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn-danger" onClick={() => setForm({ epinName: 'Activation', generatedBy: defaultGeneratedBy, qty: '1', cost: '10' })}>Reset</button>
            <button type="submit" className="btn-success">Generate</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GenerateEPin;
