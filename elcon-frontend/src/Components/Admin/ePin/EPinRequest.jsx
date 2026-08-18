import { useCallback, useEffect, useMemo, useState } from 'react';
import './EPinRequest.css';
import { getAdminEpinRequests, updateAdminEpinRequestStatus } from '../../../api/managementService';

function EPinRequest() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageSize, setPageSize] = useState('10');

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminEpinRequests(statusFilter || undefined);
      setRows(response.requests || []);
    } catch (error) {
      setRows([]);
      setError(error?.response?.data?.message || 'Failed to load ePin requests.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (!query) return true;
      return [row.clientId, row.name, row.packageCost, row.mobile, row.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    }).slice(0, Number(pageSize));
  }, [rows, search, pageSize]);

  const handleApprove = async (requestId) => {
    await updateAdminEpinRequestStatus(requestId, { status: 'Approved' });
    await loadRows();
  };

  return (
    <div>
      <h1 className="page-title">ePin Request</h1>

      <div className="panel">
        <div className="epin-header-row">
          <h2 className="epin-title">List ePin Request</h2>
        </div>

        <div className="epin-filter-grid">
          <input className="text-input" placeholder="Client ID / Name / Mobile" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="select-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select className="select-input" value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <input className="text-input" type="date" />
          <input className="text-input" type="date" />
          <button className="btn-primary" type="button" onClick={loadRows}>Search</button>
        </div>

        <div className="epin-tools">
          <button className="btn-outline">Excel</button>
          <button className="btn-outline">PDF</button>
          <button className="btn-outline">Print</button>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Action</th>
                <th>Client ID</th>
                <th>Name</th>
                <th>Package/Cost</th>
                <th>Qty</th>
                <th>Paid Amt.</th>
                <th>Mobile</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={10}>{error}</td></tr>
              ) : filteredRows.length ? filteredRows.map((row) => (
                <tr key={row._id || row.id}>
                  <td>{row.id}</td>
                  <td>
                    <button className="btn-primary" type="button" onClick={() => handleApprove(row._id)}>
                      Approve
                    </button>
                  </td>
                  <td>{row.clientId}</td>
                  <td>{row.name}</td>
                  <td>{row.packageCost}</td>
                  <td>{row.qty}</td>
                  <td>
                    <span className="epin-chip epin-chip-success">{row.paidAmount}</span>
                  </td>
                  <td>{row.mobile}</td>
                  <td>{row.date}</td>
                  <td>{row.status}</td>
                </tr>
              )) : (
                <tr><td colSpan={10}>No ePin requests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Showing Page 1 of 1 From {filteredRows.length} Rows</span>
          <div className="pagination">
            <button className="page-btn">&lt;&lt;</button>
            <button className="page-btn">&lt;</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">&gt;</button>
            <button className="page-btn">&gt;&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EPinRequest;
