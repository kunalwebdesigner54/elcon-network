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
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setEditingId(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold' }}>Edit Event</h3>
            
            <form className="np-form" onSubmit={handleEditSubmit}>
              <div className="np-row">
                <label>Type</label>
                <select className="select-input" name="type" value={editForm.type} onChange={handleEditChange}><option>Select</option><option>News and Event</option><option>Popup</option></select>
              </div>

              <div className="np-row two">
                <div>
                  <label>Publish Date</label>
                  <input className="text-input" type="date" name="publishDate" value={editForm.publishDate} onChange={handleEditChange} />
                </div>
                <div>
                  <label>Upto Date</label>
                  <input className="text-input" type="date" name="uptoDate" value={editForm.uptoDate} onChange={handleEditChange} />
                </div>
              </div>

              <div className="np-row">
                <label>Publish Status</label>
                <div className="np-radio">
                  <label><input type="radio" name="status" value="Published" checked={editForm.status === 'Published'} onChange={handleEditChange}/> Publish Now</label>
                  <label><input type="radio" name="status" value="Draft" checked={editForm.status === 'Draft'} onChange={handleEditChange}/> Save as Draft</label>
                </div>
              </div>

              <div className="np-row">
                <label>Display on</label>
                <div className="np-radio">
                  <label><input type="radio" name="displayOn" value="Member panel" checked={editForm.displayOn === 'Member panel'} onChange={handleEditChange}/> Member panel</label>
                  <label><input type="radio" name="displayOn" value="Website" checked={editForm.displayOn === 'Website'} onChange={handleEditChange}/> Website</label>
                  <label><input type="radio" name="displayOn" value="All" checked={editForm.displayOn === 'All'} onChange={handleEditChange}/> All</label>
                </div>
              </div>

              <div className="np-row">
                <label>Title</label>
                <input className="text-input" type="text" name="title" value={editForm.title} onChange={handleEditChange} />
              </div>

              <div className="np-row">
                <label>Description</label>
                <textarea className="text-input" rows="4" name="description" value={editForm.description} onChange={handleEditChange}/>
              </div>

              <div className="btn-row" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-danger" onClick={() => setEditingId(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
