import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import './AddNew.css';
import { createNewsPopup, getNewsPopupList, updateNewsPopup } from '../../../../api/managementService';

export default function AddNew(){
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState({ type: 'News and Event', publishDate: '', uptoDate: '', status: 'Published', displayOn: 'Member panel', title: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchItem = async () => {
        try {
          const res = await getNewsPopupList();
          if (res.items) {
            const item = res.items.find((i) => i.id === id || i._id === id);
            if (item) {
              setForm({
                type: item.type || 'News and Event',
                publishDate: item.publishDate ? item.publishDate.split('T')[0] : '',
                uptoDate: item.uptoDate ? item.uptoDate.split('T')[0] : '',
                status: item.status || 'Published',
                displayOn: item.displayOn || 'Member panel',
                title: item.title || '',
                description: item.description || ''
              });
            }
          }
        } catch (error) {
          console.error("Failed to fetch item", error);
        }
      };
      fetchItem();
    }
  }, [id, isEditMode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title || !form.description) {
      return Swal.fire("Error", "Title and Description are required", "error");
    }
    
    setLoading(true);
    try {
      if (isEditMode) {
        await updateNewsPopup(id, form);
        await Swal.fire("Success", "Successfully updated!", "success");
      } else {
        await createNewsPopup(form);
        await Swal.fire("Success", "Successfully added!", "success");
      }
      navigate('/admin/news-popup/list-all');
    } catch (error) {
      Swal.fire("Error", error.message || "Failed to save.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="np-add container">
      <h2 className="np-title">{isEditMode ? 'Events - Edit' : 'Events - Add'}</h2>
      <div className="np-form-wrap">
        <form className="np-form" onSubmit={handleSubmit}>
          <div className="np-row">
            <label>Type</label>
            <select className="select-input" name="type" value={form.type} onChange={handleChange}><option>Select</option><option>News and Event</option><option>Popup</option></select>
          </div>

          <div className="np-row two">
            <div>
              <label>Publish Date</label>
              <input className="text-input" type="date" name="publishDate" value={form.publishDate} onChange={handleChange} />
            </div>
            <div>
              <label>Upto Date</label>
              <input className="text-input" type="date" name="uptoDate" value={form.uptoDate} onChange={handleChange} />
            </div>
          </div>

          <div className="np-row">
            <label>Publish Status</label>
            <div className="np-radio">
              <label><input type="radio" name="status" value="Published" checked={form.status === 'Published'} onChange={handleChange}/> Publish Now</label>
              <label><input type="radio" name="status" value="Draft" checked={form.status === 'Draft'} onChange={handleChange}/> Save as Draft</label>
            </div>
          </div>

          <div className="np-row">
            <label>Display on</label>
            <div className="np-radio">
              <label><input type="radio" name="displayOn" value="Member panel" checked={form.displayOn === 'Member panel'} onChange={handleChange}/> Member panel</label>
              <label><input type="radio" name="displayOn" value="Website" checked={form.displayOn === 'Website'} onChange={handleChange}/> Website</label>
              <label><input type="radio" name="displayOn" value="All" checked={form.displayOn === 'All'} onChange={handleChange}/> All</label>
            </div>
          </div>

          <div className="np-row">
            <label>Title</label>
            <input className="text-input" type="text" name="title" value={form.title} onChange={handleChange} />
          </div>

          <div className="np-row">
            <label>Description</label>
            <textarea className="text-input" rows="6" name="description" value={form.description} onChange={handleChange}/>
          </div>

          <div className="btn-row">
            <button type="reset" className="btn-danger">Reset</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
