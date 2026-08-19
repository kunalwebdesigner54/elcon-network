import { useEffect, useMemo, useState } from 'react';
import './KYCRequest.css';
import { getAdminKycRequests, updateAdminKycStatus } from '../../../../api/membersService';

const exportColumns = [
  'S.NO',
  'STATUS',
  'MEMBER ID',
  'NAME',
  'MOBILE',
  'GOOGLE PAY NO.',
  'PHONEPE NO.',
  'UPI ID',
  'PAN NO',
  'ADHAR NO',
  'ACC HOLDER NAME',
  'ACCOUNT NO',
  'BANK NAME',
  'BRANCH',
  'IFSC CODE'
];

function KYCRequest() {
  const [kycRows, setKycRows] = useState([]);
  const [filters, setFilters] = useState({
    memberId: '',
    name: '',
    mobile: '',
    adharNo: '',
    panNo: '',
    status: '',
  });
  const [pageSize, setPageSize] = useState('10');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('PENDING');

  useEffect(() => {
    const loadKycRequests = async () => {
      try {
        setLoading(true);
        const response = await getAdminKycRequests(activeTab);
        setKycRows(response.data || []);
      } catch (error) {
        setKycRows([]);
      } finally {
        setLoading(false);
      }
    };

    loadKycRequests();
  }, [activeTab]);

  const handleUpdateStatus = async (memberId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this KYC request?`)) return;
    
    setActionLoading(true);
    try {
      await updateAdminKycStatus(memberId, { status: newStatus });
      setKycRows(prev => prev.map(row => {
        if (row.memberId === memberId) {
           if (newStatus === 'DELETE') {
             return { ...row, status: 'PENDING', adharNo: '---', panNo: '---', googlePay: '---', phonePe: '---', upiId: '---', accountHolder: '---', accountNo: '---', bankName: '---', branch: '---', ifscCode: '---', aadharFrontImage: null, aadharBackImage: null };
           }
           return { ...row, status: newStatus === 'REJECT' ? 'REJECT' : newStatus };
        }
        return row;
      }));
      alert(`KYC status updated to ${newStatus} successfully.`);
    } catch (error) {
      alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewKyc = (row) => {
    setSelectedKyc(row);
    setIsModalOpen(true);
  };

  const closeViewModal = () => {
    setIsModalOpen(false);
    setSelectedKyc(null);
  };

  const handleFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const filteredRows = useMemo(() => {
    return kycRows.filter((row) => {
      const byMember = !filters.memberId || row.memberId.toLowerCase().includes(filters.memberId.toLowerCase());
      const byName = !filters.name || row.name.toLowerCase().includes(filters.name.toLowerCase());
      const byMobile = !filters.mobile || row.mobile.toLowerCase().includes(filters.mobile.toLowerCase());
      const byAadhar = !filters.adharNo || row.adharNo.toLowerCase().includes(filters.adharNo.toLowerCase());
      const byPan = !filters.panNo || row.panNo.toLowerCase().includes(filters.panNo.toLowerCase());
      const byStatus = !filters.status || row.status === filters.status;

      return byMember && byName && byMobile && byAadhar && byPan && byStatus;
    });
  }, [filters, kycRows]);

  const visibleRows = filteredRows.slice(0, Number(pageSize));

  const formatRowsForExport = (rows) => rows.map((row) => ([
    row.sNo,
    row.status,
    row.memberId,
    row.name,
    row.mobile,
    row.googlePay,
    row.phonePe,
    row.upiId,
    row.panNo,
    row.adharNo,
    row.accountHolder,
    row.accountNo,
    row.bankName,
    row.branch,
    row.ifscCode
  ]));

  const handleExportExcel = () => {
    const csvRows = [exportColumns, ...formatRowsForExport(kycRows)]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'kyc-list.csv');
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const tableRows = formatRowsForExport(kycRows)
      .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
      .join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>KYC List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            h2 { margin: 0 0 12px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #d6d6d6; padding: 6px; font-size: 16px; text-align: left; }
            th { background: #e8f6fb; }
          </style>
        </head>
        <body>
          <h2>KYC List</h2>
          <table>
            <thead>
              <tr>${exportColumns.map((column) => `<th>${column}</th>`).join('')}</tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div>
      <h1 className="page-title" style={{ fontSize: '42px', marginBottom: '14px' }}>KYC Request</h1>

      <div className="kyc-tabs">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(tab => (
          <button 
            key={tab}
            className={`kyc-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'ALL' ? 'All History' : `${tab} Requests`}
          </button>
        ))}
      </div>

      <div className="panel" style={{ borderRadius: '28px', padding: '24px' }}>
       

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          <input className="text-input" style={{ maxWidth: '120px' }} placeholder="MEMBER ID" value={filters.memberId} onChange={handleFilterChange('memberId')} />
          <input className="text-input" style={{ maxWidth: '140px' }} placeholder="NAME" value={filters.name} onChange={handleFilterChange('name')} />
          <input className="text-input" style={{ maxWidth: '130px' }} placeholder="MOBILE" value={filters.mobile} onChange={handleFilterChange('mobile')} />
          <input className="text-input" style={{ maxWidth: '120px' }} placeholder="ADHAR NO" value={filters.adharNo} onChange={handleFilterChange('adharNo')} />
          <input className="text-input" style={{ maxWidth: '110px' }} placeholder="PAN NO" value={filters.panNo} onChange={handleFilterChange('panNo')} />
          <select className="select-input" style={{ maxWidth: '98px' }} value={filters.status} onChange={handleFilterChange('status')}>
                <option value="">STATUS</option>
                <option value="APPROVED">APPROVED</option>
                <option value="PENDING">PENDING</option>
                <option value="REJECT">REJECT</option>
              </select>
          <select className="select-input" style={{ maxWidth: '84px' }} value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="btn-primary" type="button">Search</button>
        </div>

        <div className="btn-row" style={{ justifyContent: 'flex-end', marginBottom: '14px' }}>
          <button type="button" className="btn-outline" onClick={handleExportPdf}>Export PDF</button>
          <button type="button" className="btn-outline" onClick={handleExportExcel}>Export Excel</button>
        </div>

        <section>
          <div className="table-wrap">
            <table className="data-table" style={{ minWidth: '1800px' }}>
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>ACTION</th>
                  <th>STATUS</th>
                  <th>MEMBER ID</th>
                  <th>NAME</th>
                  <th>MOBILE</th>
                  <th>GOOGLE PAY NO.</th>
                  <th>PHONEPE NO.</th>
                  <th>UPI ID</th>
                  <th>PAN NO</th>
                  <th>ADHAR NO</th>
                  <th>ADHAR PHOTO</th>
                  <th>ACC HOLDER NAME</th>
                  <th>ACCOUNT NO</th>
                  <th>BANK NAME</th>
                  <th>BRANCH</th>
                  <th>IFSC CODE</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="17">Loading...</td>
                  </tr>
                ) : visibleRows.length > 0 ? visibleRows.map((row) => (
                  <tr key={row.sNo}>
                    <td>{row.sNo}</td>
                    <td>
                      <div className="kyc-action-group">
                        <button type="button" className="kyc-action-btn kyc-action-cyan" aria-label="View" title="View Details" onClick={() => handleViewKyc(row)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        {activeTab === 'PENDING' && (
                          <>
                            <button type="button" className="kyc-action-btn kyc-action-green" aria-label="Approve" title="Approve" disabled={actionLoading} onClick={() => handleUpdateStatus(row.memberId, 'APPROVED')}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            </button>
                            <button type="button" className="kyc-action-btn kyc-action-pink" aria-label="Reject" title="Reject" disabled={actionLoading} onClick={() => handleUpdateStatus(row.memberId, 'REJECT')}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                            </button>
                          </>
                        )}
                        <button type="button" className="kyc-action-btn kyc-action-red" aria-label="Delete" title="Delete KYC Data" disabled={actionLoading} onClick={() => handleUpdateStatus(row.memberId, 'DELETE')}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                    <td>{row.status}</td>
                    <td>{row.memberId}</td>
                    <td>{row.name}</td>
                    <td>{row.mobile}</td>
                    <td>{row.googlePay}</td>
                    <td>{row.phonePe}</td>
                    <td>{row.upiId}</td>
                    <td>{row.panNo}</td>
                    <td>{row.adharNo}</td>
                    <td>
                      <div className="kyc-photo-buttons">
                        <button type="button" className="btn-outline kyc-photo-btn">Front Pic</button>
                        <button type="button" className="btn-outline kyc-photo-btn">Back Pic</button>
                      </div>
                    </td>
                    <td>{row.accountHolder}</td>
                    <td>{row.accountNo}</td>
                    <td>{row.bankName}</td>
                    <td>{row.branch}</td>
                    <td>{row.ifscCode}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="17">No KYC requests found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer" style={{ justifyContent: 'center', marginTop: '12px' }}>
            <div className="pagination">
              <button className="page-btn">&laquo;</button>
              <button className="page-btn">&lsaquo;</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <button className="page-btn">4</button>
              <button className="page-btn">5</button>
              <button className="page-btn">6</button>
              <button className="page-btn">7</button>
              <button className="page-btn">&rsaquo;</button>
              <button className="page-btn">&raquo;</button>
            </div>
          </div>
        </section>
      </div>

      {isModalOpen && selectedKyc && (
        <div className="kyc-modal-overlay" onClick={closeViewModal}>
          <div className="kyc-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="kyc-modal-header">
              <h2>KYC Details - {selectedKyc.name}</h2>
              <button className="kyc-modal-close" onClick={closeViewModal}>&times;</button>
            </div>
            <div className="kyc-modal-body">
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="kyc-detail-row">
                  <span className="kyc-detail-label">Member ID</span>
                  <span className="kyc-detail-value">{selectedKyc.memberId}</span>
                </div>
                <div className="kyc-detail-row">
                  <span className="kyc-detail-label">Status</span>
                  <span className="kyc-detail-value" style={{ 
                    color: selectedKyc.status === 'APPROVED' ? 'green' : selectedKyc.status === 'REJECT' ? 'red' : 'orange',
                    fontWeight: 'bold' 
                  }}>{selectedKyc.status}</span>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="kyc-detail-row">
                  <span className="kyc-detail-label">Aadhaar No</span>
                  <span className="kyc-detail-value">{selectedKyc.adharNo}</span>
                </div>
                <div className="kyc-detail-row">
                  <span className="kyc-detail-label">PAN No</span>
                  <span className="kyc-detail-value">{selectedKyc.panNo}</span>
                </div>
                <div className="kyc-detail-row">
                  <span className="kyc-detail-label">Mobile</span>
                  <span className="kyc-detail-value">{selectedKyc.mobile}</span>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />

              <h3 style={{ margin: '0', fontSize: '16px', color: '#444' }}>Banking Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="kyc-detail-row">
                  <span className="kyc-detail-label">Bank Name</span>
                  <span className="kyc-detail-value">{selectedKyc.bankName}</span>
                </div>
                <div className="kyc-detail-row">
                  <span className="kyc-detail-label">Account Holder</span>
                  <span className="kyc-detail-value">{selectedKyc.accountHolder}</span>
                </div>
                <div className="kyc-detail-row">
                  <span className="kyc-detail-label">Account No</span>
                  <span className="kyc-detail-value">{selectedKyc.accountNo}</span>
                </div>
                <div className="kyc-detail-row">
                  <span className="kyc-detail-label">IFSC Code</span>
                  <span className="kyc-detail-value">{selectedKyc.ifscCode}</span>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />

              <h3 style={{ margin: '0', fontSize: '16px', color: '#444' }}>Payment Apps</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="kyc-detail-row">
                  <span className="kyc-detail-label">Google Pay</span>
                  <span className="kyc-detail-value">{selectedKyc.googlePay}</span>
                </div>
                <div className="kyc-detail-row">
                  <span className="kyc-detail-label">PhonePe</span>
                  <span className="kyc-detail-value">{selectedKyc.phonePe}</span>
                </div>
                <div className="kyc-detail-row">
                  <span className="kyc-detail-label">UPI ID</span>
                  <span className="kyc-detail-value">{selectedKyc.upiId}</span>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />

              <h3 style={{ margin: '0', fontSize: '16px', color: '#444' }}>Uploaded Documents</h3>
              <div className="kyc-images-grid">
                <div className="kyc-image-card">
                  <span style={{ fontWeight: '600', color: '#333', fontSize: '13px' }}>Aadhaar Front</span>
                  {selectedKyc.aadharFrontImage ? (
                    <img src={selectedKyc.aadharFrontImage.startsWith('http') ? selectedKyc.aadharFrontImage : `http://localhost:5000/uploads/${selectedKyc.aadharFrontImage}`} alt="Aadhaar Front" className="kyc-image-preview" />
                  ) : (
                    <div className="kyc-no-image">No Image Uploaded</div>
                  )}
                </div>
                <div className="kyc-image-card">
                  <span style={{ fontWeight: '600', color: '#333', fontSize: '13px' }}>Aadhaar Back</span>
                  {selectedKyc.aadharBackImage ? (
                    <img src={selectedKyc.aadharBackImage.startsWith('http') ? selectedKyc.aadharBackImage : `http://localhost:5000/uploads/${selectedKyc.aadharBackImage}`} alt="Aadhaar Back" className="kyc-image-preview" />
                  ) : (
                    <div className="kyc-no-image">No Image Uploaded</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KYCRequest;

