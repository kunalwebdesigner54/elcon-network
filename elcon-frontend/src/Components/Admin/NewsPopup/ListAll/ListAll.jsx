import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import './ListAll.css';
import { getNewsPopupList, deleteNewsPopup, updateNewsPopup } from '../../../../api/managementService';

import { Link } from 'react-router-dom';

const RowActions = ({ id, onEdit, onDelete }) => (
  <div className="np-actions">
    <button className="np-btn np-edit" onClick={() => onEdit(id)}>✎</button>
    <button className="np-btn np-delete" onClick={() => onDelete(id)}>🗑</button>
  </div>
)

export default function ListAll(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchItems = async () => {
    try {
      const response = await getNewsPopupList();
      setItems(response.items || []);
    } catch (error) {
      setItems([]);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (!result.isConfirmed) return;

    try {
      await deleteNewsPopup(id);
      Swal.fire("Deleted!", "Item deleted successfully", "success");
      fetchItems();
    } catch (error) {
      Swal.fire("Error", error.message || "Failed to delete item", "error");
    }
  };

  const handleEditClick = (id) => {
    const item = items.find(i => i.id === id || i._id === id);
    if (item) {
      setEditForm({
        type: item.type || 'News and Event',
        publishDate: item.publishDate ? item.publishDate.split('T')[0] : '',
        uptoDate: item.uptoDate ? item.uptoDate.split('T')[0] : '',
        status: item.status || 'Published',
        displayOn: item.displayOn || 'Member panel',
        title: item.title || '',
        description: item.description || ''
      });
      setEditingId(id);
    }
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editForm.title || !editForm.description) {
      return Swal.fire("Error", "Title and Description are required", "error");
    }
    setIsUpdating(true);
    try {
      await updateNewsPopup(editingId, editForm);
      Swal.fire("Success", "Successfully updated!", "success");
      setEditingId(null);
      setEditForm(null);
      fetchItems();
    } catch (error) {
      Swal.fire("Error", error.message || "Failed to save.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTogglePopup = async (id, currentValue) => {
    const newValue = !currentValue;
    // Optimistic UI update
    setItems(prevItems => prevItems.map(item => item.id === id ? { ...item, showAsPopup: newValue } : item));
    
    try {
      await updateNewsPopup(id, { showAsPopup: newValue });
      toast.success('Updated successfully');
      // No need to fetchItems immediately, it will just re-render unnecessarily, but we can do it in background if needed
    } catch (error) {
      // Revert on error
      setItems(prevItems => prevItems.map(item => item.id === id ? { ...item, showAsPopup: currentValue } : item));
      toast.error(error.message || "Failed to update item");
    }
  };

  return (
    <div className="np-page container">
      <h2 className="np-title">News & Popup List</h2>

      <div className="np-toolbar">
        <label>List</label>
        <select className="np-select"><option>All</option><option>News</option><option>Popup</option></select>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Show as Popup</th>
              <th>Title</th>
              <th>Type</th>
              <th>Display on</th>
              <th>Publish Date</th>
              <th>Upto Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td data-label="#">{index + 1}</td>
                <td data-label="Show as Popup">
                  <input 
                    type="checkbox" 
                    checked={item.showAsPopup || false} 
                    onChange={() => handleTogglePopup(item.id, item.showAsPopup)}
                  />
                </td>
                <td data-label="Title">{item.title}</td>
                <td data-label="Type">{item.type}</td>
                <td data-label="Display on">{item.displayOn}</td>
                <td data-label="Publish Date">{item.publishDate}</td>
                <td data-label="Upto Date">{item.uptoDate}</td>
                <td data-label="Status"><span className="np-badge np-published">{item.status}</span></td>
                <td data-label="Action"><RowActions id={item.id || item._id} onEdit={handleEditClick} onDelete={handleDelete}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingId && editForm && (
        <div className="swal2-container swal2-center swal2-backdrop-show" style={{ overflowY: 'auto', zIndex: 9999 }}>
          <div className="swal2-popup swal2-modal swal2-show" style={{ display: 'grid', width: '550px', maxWidth: '95%', padding: '20px' }}>
            <h2 className="swal2-title" style={{ margin: 0, fontSize: '1.2rem' }}>Edit News / Popup</h2>
            <div className="swal2-html-container" style={{ textAlign: 'left', marginTop: '15px' }}>
              <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '13px', marginBottom: '3px', color: '#94a3b8', fontWeight: '500' }}>Type</label>
                    <select className="swal2-select" name="type" value={editForm.type} onChange={handleEditChange} style={{ margin: 0, width: '100%', height: '36px', fontSize: '14px', padding: '0 10px', boxSizing: 'border-box' }}>
                      <option value="Select">Select</option>
                      <option value="News and Event">News and Event</option>
                      <option value="Popup">Popup</option>
                    </select>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '13px', marginBottom: '3px', color: '#94a3b8', fontWeight: '500' }}>Publish Date</label>
                    <input className="swal2-input" type="date" name="publishDate" value={editForm.publishDate} onChange={handleEditChange} style={{ margin: 0, width: '100%', height: '36px', fontSize: '14px', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '13px', marginBottom: '3px', color: '#94a3b8', fontWeight: '500' }}>Upto Date</label>
                    <input className="swal2-input" type="date" name="uptoDate" value={editForm.uptoDate} onChange={handleEditChange} style={{ margin: 0, width: '100%', height: '36px', fontSize: '14px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '13px', marginBottom: '3px', color: '#94a3b8', fontWeight: '500' }}>Publish Status</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', color: '#f8fafc', fontSize: '13px', marginTop: '5px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}><input type="radio" name="status" value="Published" checked={editForm.status === 'Published'} onChange={handleEditChange}/> Published</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}><input type="radio" name="status" value="Draft" checked={editForm.status === 'Draft'} onChange={handleEditChange}/> Draft</label>
                    </div>
                  </div>
                  <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '13px', marginBottom: '3px', color: '#94a3b8', fontWeight: '500' }}>Display on</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', color: '#f8fafc', fontSize: '13px', marginTop: '5px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}><input type="radio" name="displayOn" value="Member panel" checked={editForm.displayOn === 'Member panel'} onChange={handleEditChange}/> Member</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}><input type="radio" name="displayOn" value="Website" checked={editForm.displayOn === 'Website'} onChange={handleEditChange}/> Web</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}><input type="radio" name="displayOn" value="All" checked={editForm.displayOn === 'All'} onChange={handleEditChange}/> All</label>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '13px', marginBottom: '3px', color: '#94a3b8', fontWeight: '500' }}>Title</label>
                  <input className="swal2-input" type="text" name="title" value={editForm.title} onChange={handleEditChange} style={{ margin: 0, width: '100%', height: '36px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '13px', marginBottom: '3px', color: '#94a3b8', fontWeight: '500' }}>Description</label>
                  <textarea className="swal2-textarea" rows="2" name="description" value={editForm.description} onChange={handleEditChange} style={{ margin: 0, width: '100%', fontSize: '14px', padding: '8px 10px', boxSizing: 'border-box' }}/>
                </div>

                <div className="swal2-actions" style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                  <button type="submit" className="swal2-confirm swal2-styled" disabled={isUpdating} style={{ display: 'inline-flex' }}>{isUpdating ? 'Saving...' : 'Save Changes'}</button>
                  <button type="button" className="swal2-cancel swal2-styled" onClick={() => setEditingId(null)} style={{ display: 'inline-flex' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
