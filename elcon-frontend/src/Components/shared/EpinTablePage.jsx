import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getEpinList, updateEpinStatus, transferEpin, getEpinTransferHistory } from '../../api/managementService';

const statusClass = (status) => {
  if (status === 'Used') return 'epin-chip-used';
  if (status === 'Deleted') return 'epin-chip-deleted';
  return 'epin-chip-unused';
};

export default function EpinTablePage({ title, heading, statusFilter, mode, showActions = true, showTabs = false }) {
  const location = useLocation();
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({ available: 0, used: 0 });
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ epin: '', generatedBy: '', currentOwner: '', memberId: '', fromDate: '', toDate: '' });
  const [appliedFilters, setAppliedFilters] = useState({ epin: '', generatedBy: '', currentOwner: '', memberId: '', fromDate: '', toDate: '' });

  const loadRows = useCallback(async () => {
    try {
      if (mode === 'transfer-history') {
        const response = await getEpinTransferHistory();
        setRows(response.transfers || []);
        return;
      }
      const response = await getEpinList(statusFilter ? { status: statusFilter } : {});
      setRows(response.epins || []);
      if (response.counts) {
        setCounts(response.counts);
      }
    } catch (error) {
      setRows([]);
      setCounts({ available: 0, used: 0 });
    } finally {
      setLoading(false);
    }
  }, [mode, statusFilter]);

  useEffect(() => { loadRows(); }, [loadRows]);

  const handleSearch = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesEpin = !appliedFilters.epin || String(row.epin || '').toLowerCase().includes(appliedFilters.epin.toLowerCase());
      const matchesGeneratedBy = !appliedFilters.generatedBy || String(row.genBy || row.fromMember || '').toLowerCase().includes(appliedFilters.generatedBy.toLowerCase());
      const matchesCurrentOwner = !appliedFilters.currentOwner || String(row.currentOwner || row.toMember || '').toLowerCase().includes(appliedFilters.currentOwner.toLowerCase());

      let matchesFromDate = true;
      let matchesToDate = true;
      const rowDate = row.genDate || row.transferDate;
      if (appliedFilters.fromDate && rowDate) {
        matchesFromDate = new Date(rowDate) >= new Date(appliedFilters.fromDate);
      }
      if (appliedFilters.toDate && rowDate) {
        matchesToDate = new Date(rowDate) <= new Date(appliedFilters.toDate);
      }

      return matchesEpin && matchesGeneratedBy && matchesCurrentOwner && matchesFromDate && matchesToDate;
    });
  }, [appliedFilters, rows]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  const totalPages = Math.ceil(filteredRows.length / Number(pageSize));
  const startIndex = (currentPage - 1) * Number(pageSize);
  const visibleRows = filteredRows.slice(startIndex, startIndex + Number(pageSize));
  const isTransferHistory = mode === 'transfer-history';

  const renderPageNumbers = () => {
    const pages = [];
    // if (totalPages <= 1) return pages; // We will show '1' even if there is only 1 page now.

    const maxPagesToShow = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          type="button"
          onClick={() => setCurrentPage(i)}
          style={{
            padding: '8px 12px',
            background: currentPage === i ? '#00e5ff' : '#2d3748',
            color: currentPage === i ? '#000' : '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: currentPage === i ? 'bold' : 'normal'
          }}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const handleAction = async (epinNo, action) => {
    if (action === 'delete') {
      await updateEpinStatus(epinNo, { status: 'Deleted' });
    }
    if (action === 'use') {
      await updateEpinStatus(epinNo, { status: 'Used', usedBy: 'MEMBER', usedDate: new Date().toLocaleString('en-IN') });
    }
    if (action === 'transfer') {
      await transferEpin(epinNo, { toMember: 'MEMBER' });
    }
    await loadRows();
  };

  return (
    <div>
      <h1 className="page-title">{title}</h1>
      
      {showTabs && (
        <div className="epin-tabs-container" style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
          <Link to="/user/epin/list-all-epin" style={{ color: location.pathname.includes('list-all-epin') || location.pathname.includes('all-epin') ? '#00e5ff' : '#a0aec0', textDecoration: 'none', fontWeight: 'bold', borderBottom: location.pathname.includes('list-all-epin') || location.pathname.includes('all-epin') ? '2px solid #00e5ff' : 'none', paddingBottom: '4px' }}>All epins</Link>
          <span style={{ color: '#4a5568' }}>|</span>
          <Link to="/user/epin/unused-epin" style={{ color: location.pathname.endsWith('unused-epin') ? '#00e5ff' : '#a0aec0', textDecoration: 'none', fontWeight: 'bold', borderBottom: location.pathname.endsWith('unused-epin') ? '2px solid #00e5ff' : 'none', paddingBottom: '4px' }}>Unused epin</Link>
          <span style={{ color: '#4a5568' }}>|</span>
          <Link to="/user/epin/used-epin" style={{ color: location.pathname.endsWith('/used-epin') ? '#00e5ff' : '#a0aec0', textDecoration: 'none', fontWeight: 'bold', borderBottom: location.pathname.endsWith('/used-epin') ? '2px solid #00e5ff' : 'none', paddingBottom: '4px' }}>Used epin</Link>
        </div>
      )}

      {showTabs && !isTransferHistory && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ background: 'linear-gradient(90deg, rgba(0,229,255,0.1) 0%, rgba(0,229,255,0.05) 100%)', border: '1px solid rgba(0, 229, 255, 0.2)', padding: '15px 25px', borderRadius: '12px', flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#a0aec0', fontSize: '1.1rem', fontWeight: '500' }}>Available ePins</span>
            <span style={{ color: '#00e5ff', fontSize: '1.5rem', fontWeight: 'bold' }}>{counts.available}</span>
          </div>
          <div style={{ background: 'linear-gradient(90deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '15px 25px', borderRadius: '12px', flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#a0aec0', fontSize: '1.1rem', fontWeight: '500' }}>Used ePins</span>
            <span style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 'bold' }}>{counts.used}</span>
          </div>
        </div>
      )}
      <div className="panel">
        <div className="epin-header-row"><h2 className="epin-title">{heading}</h2></div>
        <div className="epin-filter-grid">
          <input className="text-input" placeholder="ePin" value={filters.epin} onChange={(event) => setFilters((prev) => ({ ...prev, epin: event.target.value }))} />
          <input className="text-input" placeholder="Generated By" value={filters.generatedBy} onChange={(event) => setFilters((prev) => ({ ...prev, generatedBy: event.target.value }))} />
          <input className="text-input" placeholder="Current Owner" value={filters.currentOwner} onChange={(event) => setFilters((prev) => ({ ...prev, currentOwner: event.target.value }))} />
          <input className="text-input" type="date" value={filters.fromDate} onChange={(event) => setFilters((prev) => ({ ...prev, fromDate: event.target.value }))} />
          <input className="text-input" type="date" value={filters.toDate} onChange={(event) => setFilters((prev) => ({ ...prev, toDate: event.target.value }))} />
          <select className="select-input" value={pageSize} onChange={(event) => setPageSize(event.target.value)}><option value="10">10</option><option value="25">25</option><option value="50">50</option></select>
          <button className="btn-primary" type="button" onClick={handleSearch}>Search</button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              {isTransferHistory ? (
                <tr>
                  <th>#</th><th>Transfer Date</th><th>ePin</th><th>From Member</th><th>To Member</th><th>Amount</th><th>Status</th>
                </tr>
              ) : (
                <tr>
                  <th>#</th><th>ePinName</th><th>ePin</th><th>Cost</th><th>Gen. Date</th><th>Gen. By</th><th>Cur.Owner</th><th>Status</th><th>Used By</th><th>Used Date</th><th>Action</th>
                </tr>
              )}
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isTransferHistory ? 7 : 11}>Loading...</td></tr>
              ) : visibleRows.length ? visibleRows.map((row, index) => (
                isTransferHistory ? (
                  <tr key={row.epin || row.id}>
                    <td>{index + 1}</td>
                    <td>{row.transferDate}</td>
                    <td>{row.epin}</td>
                    <td>{row.fromMember}</td>
                    <td>{row.toMember}</td>
                    <td>{row.amount}</td>
                    <td><span className={`epin-chip ${statusClass(row.status)}`}>{row.status}</span></td>
                  </tr>
                ) : (
                  <tr key={row.epin || row.id}>
                    <td>{index + 1}</td>
                    <td>{row.epinName}</td>
                    <td>{row.epin}</td>
                    <td>{row.cost}</td>
                    <td>{row.genDate || row.transferDate}</td>
                    <td>{row.genBy || row.fromMember}</td>
                    <td>{row.currentOwner || row.toMember}</td>
                    <td><span className={`epin-chip ${statusClass(row.status)}`}>{row.status}</span></td>
                    <td>{row.usedBy || row.fromMember || '-'}</td>
                    <td>{row.usedDate || row.transferDate || '-'}</td>
                    <td>
                      {showActions ? (
                        <>
                          <button type="button" className="epin-delete-btn" onClick={() => handleAction(row.epin, 'delete')}>x</button>
                        </>
                      ) : '-'}
                    </td>
                  </tr>
                )
              )) : (
                <tr><td colSpan={isTransferHistory ? 7 : 11}>No Record Found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '10px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ color: '#a0aec0', fontSize: '1rem', fontWeight: '500' }}>
            Total Epins : <span style={{ color: '#fff', fontWeight: 'bold' }}>{filteredRows.length}</span>
          </div>
          
          <div style={{ display: 'flex', gap: '5px' }}>
            <button 
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '8px 12px', background: currentPage === 1 ? '#2d3748' : '#3182ce', color: '#fff', border: 'none', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              Prev
            </button>
            
            {renderPageNumbers()}
            
            <button 
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              style={{ padding: '8px 12px', background: currentPage >= totalPages ? '#2d3748' : '#3182ce', color: '#fff', border: 'none', borderRadius: '4px', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
