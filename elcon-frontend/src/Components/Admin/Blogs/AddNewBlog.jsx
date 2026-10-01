import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { createBlog, getBlogList, updateBlog } from '../../../api/blogService';
import './AddNewBlog.css';

export default function AddNewBlog(){
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', content: '', publishDate: '', status: 'Published', images: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchItem = async () => {
        try {
          const res = await getBlogList();
          if (res.items) {
            const item = res.items.find((i) => i.id === id || i._id === id);
            if (item) {
              setForm({
                title: item.title || '',
                description: item.description || '',
                content: item.content || '',
                publishDate: item.publishDate ? item.publishDate.split('T')[0] : '',
                status: item.status || 'Published',
                images: item.images || []
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

  const handleImageChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 5) {
      return Swal.fire("Warning", "You can upload a maximum of 5 images.", "warning");
    }
    const promises = files.slice(0, 5).map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    });
    try {
      const base64Images = await Promise.all(promises);
      setForm((prev) => ({ ...prev, images: base64Images }));
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to read image files.", "error");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title || !form.description) {
      return Swal.fire("Error", "Title and Description are required", "error");
    }
    
    setLoading(true);
    try {
      if (isEditMode) {
        await updateBlog(id, form);
        await Swal.fire("Success", "Successfully updated!", "success");
      } else {
        await createBlog(form);
        await Swal.fire("Success", "Successfully added!", "success");
      }
      navigate('/blogs/list-all');
    } catch (error) {
      Swal.fire("Error", error.message || "Failed to save.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blog-add container">
      <h2 className="blog-title">{isEditMode ? 'Blog - Edit' : 'Blog - Add'}</h2>
      <div className="blog-form-wrap">
        <form className="blog-form" onSubmit={handleSubmit}>
          
          <div className="blog-row">
            <label>Title</label>
            <input className="text-input" name="title" value={form.title} onChange={handleChange} placeholder="Enter title" />
          </div>

          <div className="blog-row">
            <label>Short Description (Excerpt)</label>
            <textarea className="text-input" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Brief summary" />
          </div>

          <div className="blog-row">
            <label>Full Content</label>
            <textarea className="text-input" name="content" value={form.content} onChange={handleChange} rows={8} placeholder="Main blog content" />
          </div>

          <div className="blog-row">
            <label>Images</label>
            <div className="custom-file-upload">
              <label htmlFor="blog-image-upload" className="btn-browse">
                Browse
              </label>
              <input id="blog-image-upload" type="file" multiple accept="image/*" onChange={handleImageChange} className="file-input-hidden" />
              <span className="file-name-display">
                {form.images && form.images.length > 0 ? `${form.images.length} image(s) selected` : 'No file chosen'}
              </span>
            </div>
            <small style={{ color: '#9ca3af', marginTop: '4px' }}>Max 5 images allowed.</small>
          </div>

          <div className="blog-row">
            <label>Publish Date</label>
            <input type="date" className="date-input" name="publishDate" value={form.publishDate} onChange={handleChange} />
          </div>

          <div className="blog-row">
            <label>Status</label>
            <select className="select-input" name="status" value={form.status} onChange={handleChange}>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div className="blog-submit-row">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
