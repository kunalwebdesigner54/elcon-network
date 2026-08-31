import '../../Common/AdminLayout.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEpinPackages, deleteEpinPackage, updateEpinPackage } from '../../../../api/managementService';

function EpinPackagesAdmin() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const response = await getEpinPackages();
        setPackages(response.packages || []);
      } catch (error) {
        setPackages([]);
      }
    };
    loadPackages();
  }, []);

  const handleDelete = async (id) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this package?")) {
      try {
        await deleteEpinPackage(id);
        const response = await getEpinPackages();
        setPackages(response.packages || []);
      } catch (error) {
        console.error("Error deleting package:", error);
        alert("Failed to delete package.");
      }
    }
  };

  const handleToggleVisibility = async (row) => {
    const currentStatus = row.isActive;
    const newStatus = !currentStatus;
    const id = row._id;
    
    if (!id) return;

    // Optimistic UI Update
    setPackages(prevRows => 
      prevRows.map(p => p._id === id ? { ...p, isActive: newStatus } : p)
    );

    try {
      await updateEpinPackage(id, { isActive: newStatus });
    } catch (error) {
      console.error("Error toggling status:", error);
      // Revert on failure
      setPackages(prevRows => 
        prevRows.map(p => p._id === id ? { ...p, isActive: currentStatus } : p)
      );
      alert("Failed to update status.");
    }
  };

  return (
    <div>
      <section className="panel admin-products-panel">
        <h2 className="section-title admin-products-section-title">E-PIN PACKAGES</h2>

        <div className="admin-products-filter-row">
          <div className="admin-products-filter-actions">
            <button
              type="button"
              className="btn-primary admin-add-new-btn"
              style={{ whiteSpace: 'nowrap' }}
              onClick={() => navigate('/products-package/epin-packages/add-new')}
            >
              ADD NEW PACKAGE
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table" style={{ minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Sr.No</th>
                <th>Package Name</th>
                <th>Price (₹)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {packages.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No Packages Found</td>
                </tr>
              ) : (
                packages.map((pkg, index) => (
                  <tr key={pkg._id}>
                    <td>{index + 1}</td>
                    <td>{pkg.packageName}</td>
                    <td>{pkg.price}</td>
                    <td>
                      <button
                        className={`status-btn ${pkg.isActive ? 'showing-btn' : 'hiden-btn'}`}
                        onClick={() => handleToggleVisibility(pkg)}
                      >
                        {pkg.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn delete-btn"
                          title="Delete"
                          onClick={() => handleDelete(pkg._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default EpinPackagesAdmin;
