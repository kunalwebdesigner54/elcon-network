import '../../Common/AdminLayout.css';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, deleteCategory, updateCategory } from '../../../../api/categoryService';

function ManageCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ name: '', status: '', limit: '100' });
  const [appliedFilters, setAppliedFilters] = useState({ name: '', status: '', limit: '100' });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response || []);
      } catch (error) {
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id);
        const response = await getCategories();
        setCategories(response || []);
      } catch (error) {
        console.error("Error deleting category:", error);
        alert(error.message || "Failed to delete category.");
      }
    }
  };

  const handleToggleVisibility = async (row) => {
    const currentStatus = row.status?.toUpperCase() || 'ACTIVE';
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const id = row._id;

    if (!id) return;

    // Optimistic Update
    setCategories(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));

    try {
      await updateCategory(id, { status: newStatus });
    } catch (error) {
      console.error("Error toggling status:", error);
      // Revert on failure
      setCategories(prev => prev.map(c => c._id === id ? { ...c, status: currentStatus } : c));
      alert("Failed to update status.");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(row => {
      const matchName = !appliedFilters.name || row.name?.toLowerCase().includes(appliedFilters.name.toLowerCase());
      const matchStatus = !appliedFilters.status || (row.status || '').toUpperCase() === appliedFilters.status.toUpperCase();
      return matchName && matchStatus;
    });
  }, [categories, appliedFilters]);

  const limit = parseInt(appliedFilters.limit, 10);
  const totalPages = Math.ceil(filteredCategories.length / limit) || 1;
  const currentCategories = filteredCategories.slice((currentPage - 1) * limit, currentPage * limit);

  return (
    <div className="admin-layout">
      <div className="admin-breadcrumb-row">
        <h2 className="admin-page-heading">Manage Categories</h2>
        <button className="admin-btn-primary" onClick={() => navigate('/admin/products/add-category')}>
          + Add Category
        </button>
      </div>

      <div className="admin-panel">
        <div className="admin-filter-bar">
          <input
            type="text"
            name="name"
            className="admin-input"
            placeholder="Search Name..."
            value={filters.name}
            onChange={handleFilterChange}
          />
          <select name="status" className="admin-input" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
          <select name="limit" className="admin-input" value={filters.limit} onChange={handleFilterChange}>
            <option value="10">10 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
            <option value="200">200 / page</option>
          </select>
          <button className="admin-btn-blue" onClick={handleSearch}>Search</button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>CATEGORY NAME</th>
                <th>DESCRIPTION</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {currentCategories.length > 0 ? (
                currentCategories.map((cat, idx) => (
                  <tr key={cat._id || idx}>
                    <td>{(currentPage - 1) * limit + idx + 1}</td>
                    <td>{cat.name}</td>
                    <td>{cat.description || '-'}</td>
                    <td>
                      <span className={`admin-status-badge ${cat.status?.toLowerCase() || 'active'}`}>
                        {cat.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-btns">
                        <button
                          className={`admin-icon-btn ${cat.status === 'INACTIVE' ? 'admin-icon-hidden' : 'admin-icon-view'}`}
                          title={cat.status === 'INACTIVE' ? 'Set Active' : 'Set Inactive'}
                          onClick={() => handleToggleVisibility(cat)}
                        >
                          {cat.status === 'INACTIVE' ? '🔒' : '👁️'}
                        </button>
                        <button
                          className="admin-icon-btn admin-icon-edit"
                          title="Edit"
                          onClick={() => navigate('/admin/products/add-category', { state: { category: cat } })}
                        >
                          ✏️
                        </button>
                        <button
                          className="admin-icon-btn admin-icon-delete"
                          title="Delete"
                          onClick={() => handleDelete(cat._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="admin-no-data">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="admin-pagination">
            <button className="admin-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>«</button>
            <button className="admin-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>‹</button>
            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1;
              if (p >= currentPage - 2 && p <= currentPage + 2) {
                return (
                  <button
                    key={p}
                    className={`admin-page-btn ${currentPage === p ? 'active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                );
              }
              return null;
            })}
            <button className="admin-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>›</button>
            <button className="admin-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>»</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageCategories;
