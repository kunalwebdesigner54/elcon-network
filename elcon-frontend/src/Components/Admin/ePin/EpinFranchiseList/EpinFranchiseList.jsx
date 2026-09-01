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
    navigate('/epin-franchise/create', { state: { franchise: row } });
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
          <button type="button" className="btn-primary admin-epin-franchise-btn" onClick={() => navigate('/epin-franchise/create')}>
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
                  <div className="kyc-action-group" style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                    <button type="button" className="kyc-action-btn kyc-action-cyan" aria-label="Toggle Visibility" title={row.status === 'HIDDEN' ? 'Show' : 'Hide'} onClick={() => handleToggleStatus(row)}>
                      {row.status === 'HIDDEN' ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                    <button type="button" className="kyc-action-btn kyc-action-green" aria-label="Edit" title="Edit" onClick={() => handleEdit(row)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button type="button" className="kyc-action-btn kyc-action-red" aria-label="Delete" title="Delete" onClick={() => handleDelete(row)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
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
