import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EpinFranchiseList.css';
import { deleteEpinFranchise, getEpinFranchises, updateEpinFranchise } from '../../../../api/managementService';

function AdminEpinFranchiseList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ franchiseId: '', franchiseName: '', upi: '', whatsapp: '' });
  const [franchiseRows, setFranchiseRows] = useState([]);

  const loadRows = async () => {
    try {
      const response = await getEpinFranchises();
      setFranchiseRows(response.franchises || []);
    } catch (error) {
      setFranchiseRows([]);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const rows = useMemo(() => {
    return franchiseRows.filter((row) => {
      return (
        (!filters.franchiseId || row.franchiseId.toLowerCase().includes(filters.franchiseId.toLowerCase())) &&
        (!filters.franchiseName || row.name.toLowerCase().includes(filters.franchiseName.toLowerCase())) &&
        (!filters.upi || row.upi.toLowerCase().includes(filters.upi.toLowerCase())) &&
        (!filters.whatsapp || row.whatsapp.toLowerCase().includes(filters.whatsapp.toLowerCase()))
      );
    });
  }, [filters, franchiseRows]);

  const handleFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleEdit = (row) => {
    navigate('/epin/epin-franchise/add-epin-franchise', { state: { franchise: row } });
  };

  const handleToggleStatus = async (row) => {
    await updateEpinFranchise(row.franchiseId, { ...row, status: row.status === 'SHOWING' ? 'HIDDEN' : 'SHOWING' });
    await loadRows();
  };

  const handleDelete = async (row) => {
    await deleteEpinFranchise(row.franchiseId);
    await loadRows();
  };

  return (
    <section className="panel admin-epin-franchise-panel">
      <h2 className="section-title admin-epin-franchise-title">ADD E-PIN FRANCHISE</h2>

      <div className="admin-epin-franchise-controls">
        <div className="admin-epin-franchise-filters">
          <input className="text-input admin-epin-input" placeholder="FRANCHISE ID" value={filters.franchiseId} onChange={handleFilterChange('franchiseId')} />
          <input className="text-input admin-epin-input" placeholder="FRANCHISE NAME" value={filters.franchiseName} onChange={handleFilterChange('franchiseName')} />
          <input className="text-input admin-epin-input" placeholder="UPI ID" value={filters.upi} onChange={handleFilterChange('upi')} />
          <input className="text-input admin-epin-input" placeholder="WATSAPP NO" value={filters.whatsapp} onChange={handleFilterChange('whatsapp')} />
        </div>
        <div className="admin-epin-franchise-actions">
          <button type="button" className="btn-primary admin-epin-franchise-btn" onClick={() => { setFilters({ franchiseId: '', franchiseName: '', upi: '', whatsapp: '' }); }}>
            SEARCH
          </button>
          <button type="button" className="btn-primary admin-epin-franchise-btn" onClick={() => navigate('/epin/epin-franchise/add-epin-franchise')}>
            ADD NEW
          </button>
        </div>
      </div>

      <div className="table-wrap admin-epin-franchise-table-wrap">
        <table className="data-table admin-epin-franchise-table">
          <thead>
            <tr>
              <th>S.NO</th>
              <th>FRANCHISE ID</th>
              <th>FRANCHISE NAME</th>
              <th>SCANNER IMAGE</th>
              <th>UPI ID</th>
              <th>WATSAPP NO</th>
              <th>CITY</th>
              <th>EPIN STOCK</th>
              <th>ACTION</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                <td>{row.franchiseId}</td>
                <td>{row.name}</td>
                <td>
                  <span className="admin-epin-scan-placeholder">IMG</span>
                </td>
                <td>{row.upi}</td>
                <td>{row.whatsapp}</td>
                <td>{row.city}</td>
                <td>{row.stock}</td>
                <td>
                  <div className="admin-epin-action-group">
                    <button type="button" className="admin-action-btn show" onClick={() => handleToggleStatus(row)}>O</button>
                    <button type="button" className="admin-action-btn edit" onClick={() => handleEdit(row)}>E</button>
                    <button type="button" className="admin-action-btn delete" onClick={() => handleDelete(row)}>X</button>
                  </div>
                </td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminEpinFranchiseList;
