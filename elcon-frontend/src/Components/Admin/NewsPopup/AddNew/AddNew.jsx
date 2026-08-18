import { useState } from 'react';
import './AddNew.css';
import { createNewsPopup } from '../../../../api/managementService';

export default function AddNew(){
  const [form, setForm] = useState({ type: 'News and Event', publishDate: '', uptoDate: '', status: 'Published', displayOn: 'Member panel', title: '', description: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await createNewsPopup(form);
  };

  return (
    <div className="np-add container">
      <h2 className="np-title">Events - Add</h2>
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
            <button type="submit" className="btn-primary">Add</button>
          </div>
        </form>
      </div>
    </div>
  )
}
