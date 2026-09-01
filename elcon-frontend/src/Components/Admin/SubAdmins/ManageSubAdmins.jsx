import React, { useState, useEffect } from 'react';
import "../Common/AdminLayout.css";
import { getSubAdmins, createSubAdmin, updateSubAdmin, deleteSubAdmin } from "../../../api/managementService";

const AVAILABLE_PERMISSIONS = [
  { id: 'kyc_verification', label: 'KYC Verification' },
  { id: 'address_update', label: 'Address & Profile Update' },
  { id: 'epin_management', label: 'E-Pin Management' },
  { id: 'product_management', label: 'Product & Packages' },
  { id: 'user_management', label: 'User Management (Team/Network)' },
  { id: 'reports', label: 'Reports & Transactions' },
  { id: 'support', label: 'Support Tickets' },
  { id: 'wallet_management', label: 'Wallet & Discount Coupons' }
];

function ManageSubAdmins() {
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    _id: '',
    memberId: '',
    name: '',
    email: '',
    contactNo: '',
    password: '',
    accountStatus: 'ACTIVE',
    permissions: []
  });

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  const fetchSubAdmins = async () => {
    try {
      const res = await getSubAdmins();
      if (res.success) setSubAdmins(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (permId) => {
    setFormData(prev => {
      const newPerms = prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId];
      return { ...prev, permissions: newPerms };
    });
  };

  const resetForm = () => {
    setFormData({
      _id: '',
      memberId: '',
      name: '',
      email: '',
      contactNo: '',
      password: '',
      accountStatus: 'ACTIVE',
      permissions: []
    });
    setIsEditing(false);
    setMessage(null);
  };

  const handleEdit = (admin) => {
    setFormData({
      _id: admin._id,
      memberId: admin.memberId || '',
      name: admin.name || '',
      email: admin.email || '',
      contactNo: admin.contactNo || '',
      password: '',
      accountStatus: admin.accountStatus || 'ACTIVE',
      permissions: admin.permissions || []
    });
    setIsEditing(true);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Sub-Admin?')) {
      try {
        const res = await deleteSubAdmin(id);
        if (res.success) {
          setMessage({ type: 'success', text: res.message });
          fetchSubAdmins();
        }
      } catch (err) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Delete failed' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      if (isEditing) {
        const res = await updateSubAdmin(formData._id, formData);
        if (res.success) {
          setMessage({ type: 'success', text: res.message });
          resetForm();
          fetchSubAdmins();
        } else {
          setMessage({ type: 'error', text: res.message });
        }
      } else {
        if (!formData.password) {
          setMessage({ type: 'error', text: 'Password is required for new sub-admin' });
          setLoading(false);
          return;
        }
        const res = await createSubAdmin(formData);
        if (res.success) {
          setMessage({ type: 'success', text: res.message });
          resetForm();
          fetchSubAdmins();
        } else {
          setMessage({ type: 'error', text: res.message });
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="panel admin-products-panel" style={{ marginBottom: '30px' }}>
        <h2 className="section-title admin-products-section-title">
          {isEditing ? 'EDIT SUB-ADMIN' : 'ADD SUB-ADMIN'}
        </h2>

        {message && (
          <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-add-product-form">
          <div className="form-group row">
            <label className="col-sm-3 col-form-label">Name <span>*</span></label>
            <div className="col-sm-9">
              <input type="text" name="name" className="text-input" value={formData.name} onChange={handleInputChange} required />
            </div>
          </div>
          
          <div className="form-group row">
            <label className="col-sm-3 col-form-label">Email <span>*</span></label>
            <div className="col-sm-9">
              <input type="email" name="email" className="text-input" value={formData.email} onChange={handleInputChange} required disabled={isEditing} />
            </div>
          </div>

          <div className="form-group row">
            <label className="col-sm-3 col-form-label">Contact No <span>*</span></label>
            <div className="col-sm-9">
              <input type="text" name="contactNo" className="text-input" value={formData.contactNo} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="form-group row">
            <label className="col-sm-3 col-form-label">Password {isEditing ? '' : ' *'}</label>
            <div className="col-sm-9">
              <input 
                type="password" 
                name="password" 
                className="text-input" 
                value={formData.password} 
                onChange={handleInputChange} 
                placeholder={isEditing ? 'Leave blank to keep unchanged' : 'Enter Password'}
                required={!isEditing} 
              />
            </div>
          </div>

          {isEditing && (
            <div className="form-group row">
              <label className="col-sm-3 col-form-label">Status</label>
              <div className="col-sm-9">
                <select name="accountStatus" className="select-input" value={formData.accountStatus} onChange={handleInputChange}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="IN-ACTIVE">IN-ACTIVE</option>
                </select>
              </div>
            </div>
          )}

          <div className="form-group row">
            <label className="col-sm-3 col-form-label">Permissions</label>
            <div className="col-sm-9" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {AVAILABLE_PERMISSIONS.map(perm => (
                <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.permissions.includes(perm.id)} 
                    onChange={() => handleCheckboxChange(perm.id)} 
                  />
                  {perm.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {isEditing && (
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Sub-Admin' : 'Create Sub-Admin')}
            </button>
          </div>
        </form>
      </section>

      <section className="panel admin-products-panel">
        <h2 className="section-title admin-products-section-title">SUB-ADMIN LIST</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>MEMBER ID</th>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {subAdmins.map((admin, index) => (
                <tr key={admin._id}>
                  <td>{index + 1}</td>
                  <td>{admin.memberId}</td>
                  <td>{admin.name}</td>
                  <td>{admin.email}</td>
                  <td>
                    <span className={admin.accountStatus === 'ACTIVE' ? 'status-active' : 'status-inactive'}>
                      {admin.accountStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => handleEdit(admin)}>
                        Edit
                      </button>
                      <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', background: '#dc3545', color: '#fff', border: 'none' }} onClick={() => handleDelete(admin._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {subAdmins.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>No Sub-Admins found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default ManageSubAdmins;
