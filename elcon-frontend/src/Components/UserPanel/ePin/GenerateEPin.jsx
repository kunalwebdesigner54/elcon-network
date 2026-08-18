import { useMemo, useState } from "react";
import "./GenerateEPin.css";
import { generateEpins } from '../../../api/managementService';

const GenerateEPin = () => {
  const defaultGeneratedForId = useMemo(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      return storedUser.memberId || storedUser.epin || storedUser.id || 'ADMIN';
    } catch (error) {
      return 'ADMIN';
    }
  }, []);

  const [form, setForm] = useState({ epinName: 'Activation', qty: '1', generatedForId: defaultGeneratedForId });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await generateEpins({ epinName: form.epinName, generatedBy: form.generatedForId, currentOwner: form.generatedForId, qty: form.qty, cost: 10 });
  };

  return (
    <div className="buyepin-container">
      <h1 className="buyepin-title">Generate ePin</h1>
      <div className="buyepin-panel">
        <form className="buyepin-form-grid" onSubmit={handleSubmit}>
          <div className="buyepin-section buyepin-single-card">
            <div className="buyepin-single-flex">
              <div className="buyepin-single-left" style={{width: '100%'}}>
                <div className="buyepin-form-fields" style={{width: '100%'}}>
                  <div className="buyepin-form-col" style={{width: '100%'}}>
                    <div className="buyepin-input-group">
                      <label>Required No Of ePins</label>
                      <input type="text" value="No cash wallet" disabled />
                    </div>
                    <div className="buyepin-input-group">
                      <label>Package</label>
                      <select name="epinName" value={form.epinName} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="basic">Basic</option>
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>
                    <div className="buyepin-input-group">
                      <label>Generation Date</label>
                      <input type="text" value="23-03-2026" disabled />
                    </div>
                    <div className="buyepin-input-group">
                      <label>Generated For ID</label>
                      <input type="text" name="generatedForId" value={form.generatedForId} onChange={handleChange} />
                    </div>
                  </div>
                </div>
                <div className="buyepin-btn-row">
                  <button className="buyepin-btn-blue" type="submit">SUBMIT</button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateEPin;
