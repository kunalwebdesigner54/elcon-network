import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMemberProfile, updateMemberProfile } from '../../../../api/membersService';
import './EditProfile.css';

function EditProfile() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    contactNo: '',
    city: '',
    password: '',
    transPassword: '',
    accountStatus: 'ACTIVE'
  });

  useEffect(() => {
    fetchProfile();
  }, [memberId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getMemberProfile(memberId);
      if (response.success && response.data) {
        const { name, email, contactNo, city, plainPassword, plainTransactionPassword, accountStatus } = response.data;
        setForm({
          name: name || '',
          email: email || '',
          contactNo: contactNo || '',
          city: city || '',
          password: plainPassword || '',
          transPassword: plainTransactionPassword || '',
          accountStatus: accountStatus || 'ACTIVE'
        });
      } else {
        setError('Failed to fetch profile.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      setSuccessMessage('');
      const response = await updateMemberProfile(memberId, form);
      if (response.success) {
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => navigate('/admin/members/all-members-list'), 1500);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error updating profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;

  return (
    <div>
      <h1 className="page-title">Edit Profile: {memberId}</h1>

      <div className="panel">
        {error && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        {successMessage && <div className="success-message" style={{ color: 'green', marginBottom: '15px' }}>{successMessage}</div>}
        
        <form onSubmit={handleSubmit} className="form-grid-wide" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label className="field-label" style={{ color: 'white' }}>Member Name</label>
            <input className="text-input" name="name" value={form.name} onChange={handleChange} style={{ width: '100%', padding: '8px' }} required />
          </div>
          <div>
            <label className="field-label" style={{ color: 'white' }}>Email</label>
            <input className="text-input" name="email" type="email" value={form.email} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label className="field-label" style={{ color: 'white' }}>Mobile</label>
            <input className="text-input" name="contactNo" value={form.contactNo} onChange={handleChange} style={{ width: '100%', padding: '8px' }} required />
          </div>
          <div>
            <label className="field-label" style={{ color: 'white' }}>City</label>
            <input className="text-input" name="city" value={form.city} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label className="field-label" style={{ color: 'white' }}>Login Password</label>
            <input className="text-input" name="password" value={form.password} onChange={handleChange} style={{ width: '100%', padding: '8px' }} required />
          </div>
          <div>
            <label className="field-label" style={{ color: 'white' }}>Transaction Password</label>
            <input className="text-input" name="transPassword" value={form.transPassword} onChange={handleChange} style={{ width: '100%', padding: '8px' }} required />
          </div>
          <div>
            <label className="field-label" style={{ color: 'white' }}>Status</label>
            <select className="text-input" name="accountStatus" value={form.accountStatus} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="IN-ACTIVE">IN-ACTIVE</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
          </div>
          
          <div className="btn-row" style={{ marginTop: 14, display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Profile'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/admin/members/all-members-list')} style={{ background: '#333', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
