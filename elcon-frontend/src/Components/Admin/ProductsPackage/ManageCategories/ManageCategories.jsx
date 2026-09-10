import './ManageCategories.css';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, deleteCategory, updateCategory } from '../../../../api/categoryService';
import { eventEmitter, CATEGORY_EVENTS } from '../../../../utils/eventEmitter';

function ManageCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ name: '', status: '', limit: '100' });
  const [appliedFilters, setAppliedFilters] = useState({ name: '', status: '', limit: '100' });

  const loadCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getCategories();
      setCategories(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error loading categories:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to load categories. Please try again.';
      setError(msg);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Listen for category changes from other pages
  useEffect(() => {
    const unsubscribeAdded = eventEmitter.on(CATEGORY_EVENTS.CATEGORY_ADDED, loadCategories);
    const unsubscribeUpdated = eventEmitter.on(CATEGORY_EVENTS.CATEGORY_UPDATED, loadCategories);
    const unsubscribeDeleted = eventEmitter.on(CATEGORY_EVENTS.CATEGORY_DELETED, loadCategories);
    return () => {
      unsubscribeAdded();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, []);

  const handleDelete = async (id) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id);
        eventEmitter.emit(CATEGORY_EVENTS.CATEGORY_DELETED, { id });
        await loadCategories();
      } catch (err) {
        console.error("Error deleting category:", err);
        const msg = err?.response?.data?.message || err?.message || "Failed to delete category.";
        alert(msg);
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
    <div className="manage-categories-container">
      <div className="manage-categories-header">
        <h2 className="manage-categories-title">Manage Categories</h2>
        <button className="btn-add-category" onClick={() => navigate('/products-package/add-category')}>
          <span>+</span> Add Category
        </button>
      </div>

      {error && (
        <div className="manage-categories-alert error">
          <span>⚠️ {error}</span>
          <button className="btn-retry" onClick={loadCategories}>Retry</button>
        </div>
      )}

      {loading && (
        <div className="manage-categories-loading">
          ⏳ Loading categories...
        </div>
      )}

      {!loading && (
        <div className="manage-categories-panel">
          <div className="manage-categories-filter-bar">
            <input
              type="text"
              name="name"
              className="filter-input"
              placeholder="Search Name..."
              value={filters.name}
              onChange={handleFilterChange}
            />
            <select name="status" className="filter-select" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            <select name="limit" className="filter-select" value={filters.limit} onChange={handleFilterChange}>
              <option value="10">10 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
              <option value="200">200 / page</option>
            </select>
            <button className="btn-search" onClick={handleSearch}>Search</button>
          </div>

          <div className="manage-categories-table-wrap">
            <table className="manage-categories-table">
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
                        <span className={`status-badge ${(cat.status || 'ACTIVE').toLowerCase()}`}>
                          {cat.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className={`action-btn ${cat.status === 'INACTIVE' ? 'hidden' : 'view'}`}
                            title={cat.status === 'INACTIVE' ? 'Set Active' : 'Set Inactive'}
                            onClick={() => handleToggleVisibility(cat)}
                          >
                            {cat.status === 'INACTIVE' ? '🔓' : '🔒'}
                          </button>
                          <button
                            className="action-btn edit"
                            title="Edit"
                            onClick={() => navigate('/products-package/add-category', { state: { category: cat } })}
                          >
                            ✏️
                          </button>
                          <button
                            className="action-btn delete"
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
                    <td colSpan="5" className="manage-categories-empty">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <span className="pagination-info">
                Showing Page {currentPage} of {totalPages} — {filteredCategories.length} Categories
              </span>
              <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>«</button>
              <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>‹</button>
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                if (p >= currentPage - 2 && p <= currentPage + 2) {
                  return (
                    <button
                      key={p}
                      className={`page-btn ${currentPage === p ? 'active' : ''}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  );
                }
                return null;
              })}
              <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>›</button>
              <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>»</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ManageCategories;
