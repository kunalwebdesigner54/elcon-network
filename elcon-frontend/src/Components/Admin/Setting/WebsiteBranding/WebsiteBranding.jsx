import React, { useState, useEffect } from 'react';
import { getBranding, updateBranding } from '../../../../api/managementService';
import Swal from 'sweetalert2';
import './WebsiteBranding.css';

export default function WebsiteBranding() {
  const [branding, setBranding] = useState({ logo: '', banners: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const response = await getBranding();
      if (response.branding) {
        setBranding(response.branding);
      }
    } catch (error) {
      console.error('Failed to fetch branding settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBranding({ ...branding, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + branding.banners.length > 5) {
      Swal.fire({ icon: 'error', title: 'Limit Exceeded', text: 'You can only upload up to 5 banners in total.' });
      return;
    }
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBranding((prev) => ({
          ...prev,
          banners: [...prev.banners, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeBanner = (index) => {
    const updatedBanners = [...branding.banners];
    updatedBanners.splice(index, 1);
    setBranding({ ...branding, banners: updatedBanners });
  };

  const removeLogo = () => {
    setBranding({ ...branding, logo: '' });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await updateBranding(branding);
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Saved!',
          text: 'Website branding has been updated successfully.',
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to update branding settings.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !branding.logo && branding.banners.length === 0) return <div className="loader">Loading...</div>;

  return (
    <div className="branding-setting-container">
      <h1 className="page-title" style={{ fontSize: '28px', marginBottom: '24px' }}>Website Branding</h1>
      
      <div className="branding-section">
        <h2 className="section-title">Website Logo</h2>
        <div className="branding-upload-area">
          {branding.logo ? (
            <div className="preview-container logo-preview">
              <img src={branding.logo} alt="Website Logo" />
              <button className="remove-btn" onClick={removeLogo}>Remove Logo</button>
            </div>
          ) : (
            <div className="upload-placeholder">
              <label htmlFor="logo-upload" className="upload-label">
                <i className="fa-solid fa-cloud-arrow-up"></i>
                <span>Upload Logo (PNG, JPG)</span>
              </label>
              <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoUpload} hidden />
            </div>
          )}
        </div>
      </div>

      <div className="branding-section">
        <h2 className="section-title">Home Page Banners (Max 5)</h2>
        <div className="branding-upload-area">
          <div className="banners-grid">
            {branding.banners.map((banner, index) => (
              <div key={index} className="preview-container banner-preview">
                <img src={banner} alt={`Banner ${index + 1}`} />
                <button className="remove-btn-small" onClick={() => removeBanner(index)}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            ))}
            
            {branding.banners.length < 5 && (
              <div className="upload-placeholder banner-placeholder">
                <label htmlFor="banner-upload" className="upload-label">
                  <i className="fa-solid fa-plus"></i>
                  <span>Add Banner</span>
                </label>
                <input type="file" id="banner-upload" accept="image/*" multiple onChange={handleBannerUpload} hidden />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="branding-actions">
        <button className="branding-save-btn" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
