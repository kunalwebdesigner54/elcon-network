import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import './ListAll.css';
import { getNewsPopupList, deleteNewsPopup, updateNewsPopup } from '../../../../api/managementService';

import { Link } from 'react-router-dom';

const RowActions = ({ id, onDelete }) => (
  <div className="np-actions">
    <Link to={`/admin/news-popup/edit/${id}`} className="np-btn np-edit">✎</Link>
    <button className="np-btn np-delete" onClick={() => onDelete(id)}>🗑</button>
  </div>
)

export default function ListAll(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

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
                <td data-label="Action"><RowActions id={item.id} onDelete={handleDelete}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
