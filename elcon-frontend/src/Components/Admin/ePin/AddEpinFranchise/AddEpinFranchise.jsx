import qrCode from '../../../../Assets/Pictures/QR-Code.png';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getEpinFranchises, upsertEpinFranchise, updateEpinFranchise, getEpinList } from '../../../../api/managementService';
import { getSponsorDetails } from '../../../../api/authService';
import { useRef } from 'react';
import './AddEpinFranchise.css';

function AddEpinFranchise() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [franchise, setFranchise] = useState({ franchiseId: '', franchiseName: '', upiId: '', whatsappNo: '', city: '', stock: '0', status: 'SHOWING', qrImage: '' });

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
        qrImage: selectedFranchise.qrImage || '',
      });
      return;
    }
      setFranchise({
        franchiseId: '',
        franchiseName: '',
        upiId: '',
        whatsappNo: '',
        city: '',
        stock: '0',
        status: 'SHOWING',
        qrImage: '',
      });
  }, [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFranchise((prev) => ({ ...prev, [name]: value }));
  };

  const handleFranchiseIdBlur = async () => {
    if (franchise.franchiseId && franchise.franchiseId.trim() !== '') {
      let stockCount = undefined;
      try {
        const epinsRes = await getEpinList({ currentOwner: franchise.franchiseId, status: 'Unused' });
        if (epinsRes && epinsRes.epins) {
          stockCount = epinsRes.epins.length;
        }
      } catch (e) {
        console.error("Failed to fetch E-Pin stock", e);
      }

      try {
        const response = await getSponsorDetails(franchise.franchiseId);
        if (response && response.success && response.data) {
          setFranchise((prev) => ({ 
            ...prev, 
            franchiseName: response.data.name || prev.franchiseName,
            city: response.data.city || prev.city,
            upiId: response.data.upiId || prev.upiId,
            stock: stockCount !== undefined ? String(stockCount) : (response.data.stock !== undefined ? String(response.data.stock) : prev.stock)
          }));
        } else if (stockCount !== undefined) {
          setFranchise((prev) => ({ ...prev, stock: String(stockCount) }));
        }
      } catch (error) {
        console.error("Error fetching sponsor details:", error);
        if (stockCount !== undefined) {
          setFranchise((prev) => ({ ...prev, stock: String(stockCount) }));
        }
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFranchise((prev) => ({ ...prev, qrImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
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
                <img src={franchise.qrImage || qrCode} alt="Franchise QR code" className="add-epin-qr-image" style={{ objectFit: 'contain' }} />
              </div>
              <div className="add-epin-qr-actions">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange} 
                />
                <button type="button" className="btn-secondary add-epin-btn" onClick={() => fileInputRef.current && fileInputRef.current.click()}>SELECT</button>
                <button type="submit" className="btn-primary add-epin-btn">ADD</button>
              </div>
            </div>

            <div className="add-epin-details-column">
              <div className="add-epin-form-group">
                <label className="field-label">FRANCHISE ID</label>
                <input className="text-input" name="franchiseId" value={franchise.franchiseId} onChange={handleChange} onBlur={handleFranchiseIdBlur} />
              </div>
              <div className="add-epin-form-group">
                <label className="field-label">FRANCHISE NAME</label>
                <input className="text-input" name="franchiseName" value={franchise.franchiseName} onChange={handleChange} />
              </div>
              <div className="add-epin-form-group">
                <label className="field-label">UPI ID</label>
                <input className="text-input" name="upiId" value={franchise.upiId} onChange={handleChange} />
              </div>
              <div className="add-epin-form-group">
                <label className="field-label">WHATSAPP NO</label>
                <input className="text-input" name="whatsappNo" value={franchise.whatsappNo} onChange={handleChange} />
              </div>
              <div className="add-epin-form-group">
                <label className="field-label">CITY</label>
                <input className="text-input" name="city" value={franchise.city} onChange={handleChange} />
              </div>
              <div className="add-epin-form-group">
                <label className="field-label">E PIN STOCK</label>
                <input className="text-input" type="number" name="stock" value={franchise.stock} onChange={handleChange} />
              </div>
              <div className="add-epin-form-group">
                <label className="field-label">STATUS</label>
                <select className="select-input" name="status" value={franchise.status} onChange={handleChange}>
                  <option value="SHOWING">SHOWING</option>
                  <option value="HIDDEN">HIDDEN</option>
                </select>
              </div>
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
