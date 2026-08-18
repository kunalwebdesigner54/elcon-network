import qrCode from '../../../../Assets/Pictures/QR-Code.png';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getEpinFranchises, upsertEpinFranchise, updateEpinFranchise } from '../../../../api/managementService';
import './AddEpinFranchise.css';

function AddEpinFranchise() {
  const navigate = useNavigate();
  const location = useLocation();
  const [franchise, setFranchise] = useState({ franchiseId: '', franchiseName: '', upiId: '', whatsappNo: '', city: '', stock: '0', status: 'SHOWING' });

  useEffect(() => {
    const selectedFranchise = location.state?.franchise;
    if (selectedFranchise) {
      setFranchise({
        franchiseId: selectedFranchise.franchiseId || '',
        franchiseName: selectedFranchise.name || '',
        upiId: selectedFranchise.upi || '',
        whatsappNo: selectedFranchise.whatsapp || '',
        city: selectedFranchise.city || '',
        stock: String(selectedFranchise.stock || 0),
        status: selectedFranchise.status || 'SHOWING',
      });
      return;
    }

    (async () => {
      try {
        const response = await getEpinFranchises();
        const first = response.franchises?.[0];
        if (first) {
          setFranchise({
            franchiseId: first.franchiseId || '',
            franchiseName: first.name || '',
            upiId: first.upi || '',
            whatsappNo: first.whatsapp || '',
            city: first.city || '',
            stock: String(first.stock || 0),
            status: first.status || 'SHOWING',
          });
        }
      } catch (error) {
        setFranchise((prev) => prev);
      }
    })();
  }, [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFranchise((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (location.state?.franchise) {
      await updateEpinFranchise(franchise.franchiseId, franchise);
    } else {
      await upsertEpinFranchise(franchise);
    }
    navigate('/epin/epin-franchise');
  };

  return (
    <div className="admin-add-epin-page">
     
      <section className="panel add-epin-panel">
        <h2 className="section-title add-epin-title">ADD-UPDATE FRANCHISE</h2>

        <form className="add-epin-card" onSubmit={handleSubmit}>
          <div className="add-epin-grid">
            <div className="add-epin-qr-column">
              <div className="add-epin-qr-box">
                <img src={qrCode} alt="Franchise QR code" className="add-epin-qr-image" />
              </div>
              <div className="add-epin-qr-actions">
                <button type="button" className="btn-secondary add-epin-btn">SELECT</button>
                <button type="button" className="btn-primary add-epin-btn">ADD</button>
              </div>
            </div>

            <div className="add-epin-details-column">
              <table className="details-table">
                <tbody>
                  <tr>
                    <th>FRANCHISE ID</th>
                    <td><input className="text-input" name="franchiseId" value={franchise.franchiseId} onChange={handleChange} /></td>
                  </tr>
                  <tr>
                    <th>FRANCHISE NAME</th>
                    <td><input className="text-input" name="franchiseName" value={franchise.franchiseName} onChange={handleChange} /></td>
                  </tr>
                  <tr>
                    <th>UPI ID</th>
                    <td><input className="text-input" name="upiId" value={franchise.upiId} onChange={handleChange} /></td>
                  </tr>
                  <tr>
                    <th>WATSAPP NO</th>
                    <td><input className="text-input" name="whatsappNo" value={franchise.whatsappNo} onChange={handleChange} /></td>
                  </tr>
                  <tr>
                    <th>CITY</th>
                    <td><input className="text-input" name="city" value={franchise.city} onChange={handleChange} /></td>
                  </tr>
                  <tr>
                    <th>E PIN STOCK</th>
                    <td><input className="text-input" type="number" name="stock" value={franchise.stock} onChange={handleChange} /></td>
                  </tr>
                  <tr>
                    <th>STATUS</th>
                    <td>
                      <select className="select-input" name="status" value={franchise.status} onChange={handleChange}>
                        <option value="SHOWING">SHOWING</option>
                        <option value="HIDDEN">HIDDEN</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="add-epin-actions">
            <button type="button" className="btn-danger add-epin-action-btn" onClick={() => navigate('/epin/epin-franchise')}>CANCEL</button>
            <button type="submit" className="btn-primary add-epin-action-btn">SAVE</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AddEpinFranchise;
