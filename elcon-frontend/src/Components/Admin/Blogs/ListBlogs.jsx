import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getBlogList, deleteBlog } from '../../../api/blogService';
import './ListBlogs.css'; // Will use similar styling to ListAll.css

export default function ListBlogs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getBlogList();
      if (res.success && res.items) {
        setItems(res.items);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });
    
    if (confirm.isConfirmed) {
      try {
        await deleteBlog(id);
        Swal.fire("Deleted!", "The blog has been deleted.", "success");
        fetchItems();
      } catch (error) {
        Swal.fire("Error", "Could not delete blog", "error");
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/blogs/edit/${id}`);
  };

  return (
    <div className="blog-list-container">
      <div className="blog-list-header">
        <h2>List All Blogs</h2>
        <button className="btn-add-new" onClick={() => navigate('/admin/blogs/add-new')}>
          + Add New Blog
        </button>
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="blog-table-responsive">
          <table className="blog-table">
            <thead>
              <tr>
                <th>Sr No.</th>
                <th>Image</th>
                <th>Title</th>
                <th>Publish Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id || item._id}>
                  <td>{idx + 1}</td>
                  <td>
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt="blog" className="blog-thumb" />
                    ) : (
                      'No Image'
                    )}
                  </td>
                  <td>{item.title}</td>
                  <td>{item.publishDate}</td>
                  <td>
                    <span className={`status-badge ${item.status === 'Published' ? 'published' : 'draft'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-action edit" onClick={() => handleEdit(item.id || item._id)}>
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button className="btn-action delete" onClick={() => handleDelete(item.id || item._id)}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center">No blogs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
