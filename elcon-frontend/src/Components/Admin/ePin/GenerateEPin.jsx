import { useMemo, useState } from "react";
import './GenerateEPin.css';
import { generateEpins } from '../../../api/managementService';

function GenerateEPin() {
  const defaultGeneratedBy = useMemo(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      return storedUser.memberId || storedUser.epin || storedUser.id || 'ADMIN';
    } catch (error) {
      return 'ADMIN';
    }
  }, []);

  const [form, setForm] = useState({ epinName: 'Activation', generatedBy: defaultGeneratedBy, qty: '1' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await generateEpins({ epinName: form.epinName, generatedBy: form.generatedBy, qty: form.qty, cost: 10 });
  };

  return (
    <div>
      <h1 className="page-title">Generate ePin</h1>

      <div className="panel">
        <div className="epin-header-row">
          <h2 className="epin-title">Generate ePin</h2>
        </div>

        <form className="epin-generate-grid" onSubmit={handleSubmit}>
          <label className="field-label">Type</label>
          <select className="select-input" name="epinName" value={form.epinName} onChange={handleChange}>
            <option>ePin Name</option>
            <option>Activation</option>
          </select>

          <label className="field-label">Client ID</label>
          <input className="text-input" placeholder="Client ID" name="generatedBy" value={form.generatedBy} onChange={handleChange} />

          <label className="field-label">Required no.of ePin</label>
          <input className="text-input" type="number" min="1" placeholder="Required no.of ePin" name="qty" value={form.qty} onChange={handleChange} />
        </form>

        <div className="epin-generate-actions">
          <button className="btn-danger">Reset</button>
          <button className="btn-success">Generate</button>
        </div>
      </div>
    </div>
  );
}

export default GenerateEPin;
