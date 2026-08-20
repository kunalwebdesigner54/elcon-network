import { useEffect, useMemo, useState } from 'react';
import { getAllMembersList, updateBlockStatus } from '../../../../api/membersService';
import Swal from 'sweetalert2';

const MemberInformation = () => {
  const [membersData, setMembersData] = useState([]);
  const [filters, setFilters] = useState({
    memberId: '',
    name: '',
    status: '',
  });
  const [pageSize, setPageSize] = useState('10');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadMembers = async () => {
    try {
      const response = await getAllMembersList();
      setMembersData(response.data || []);
    } catch (error) {
      setMembersData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleToggleBlock = async (memberId, currentStatus) => {
    const isCurrentlyBlocked = currentStatus === 'Block';
    const actionText = isCurrentlyBlocked ? 'UNBLOCK' : 'BLOCK';
    
    const result = await Swal.fire({
      icon: 'warning',
      title: `Are you sure you want to ${actionText}?`,
      html: `Member ID: <strong>${memberId}</strong>`,
      showCancelButton: true,
      confirmButtonText: isCurrentlyBlocked ? `🔓 Yes, unblock it!` : `🔒 Yes, block it!`,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#00d284', 
      cancelButtonColor: '#4b5563',
      background: '#1e2029',
      color: '#fff',
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoading(memberId);
      await updateBlockStatus(memberId, !isCurrentlyBlocked);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Member successfully ${actionText.toLowerCase()}ed.`,
        background: '#1e2029',
        color: '#fff',
        confirmButtonColor: '#00d284'
      });
      
      await loadMembers();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err?.response?.data?.message || `Failed to ${actionText.toLowerCase()} member.`,
        background: '#1e2029',
        color: '#fff',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const filteredMembers = useMemo(() => {
    return membersData.filter((member) => {
      const byMember = !filters.memberId || (member.memberId && member.memberId.toLowerCase().includes(filters.memberId.toLowerCase()));
      const byName = !filters.name || (member.name && member.name.toLowerCase().includes(filters.name.toLowerCase()));
      const byStatus = !filters.status || member.status === filters.status;

      return byMember && byName && byStatus;
    });
  }, [filters, membersData]);

  const visibleMembers = filteredMembers.slice(0, Number(pageSize));

  return (
    <div>
      <h1 className="page-title" style={{ fontSize: '42px', marginBottom: '14px' }}>Member Information</h1>

      <div className="panel" style={{ borderRadius: '28px', padding: '24px' }}>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          <input className="text-input" style={{ maxWidth: '140px' }} placeholder="MEMBER ID" value={filters.memberId} onChange={handleFilterChange('memberId')} />
          <input className="text-input" style={{ maxWidth: '160px' }} placeholder="NAME" value={filters.name} onChange={handleFilterChange('name')} />
          <select className="select-input" style={{ maxWidth: '120px' }} value={filters.status} onChange={handleFilterChange('status')}>
            <option value="">STATUS</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="IN-ACTIVE">IN-ACTIVE</option>
          </select>
          <select className="select-input" style={{ maxWidth: '84px' }} value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="btn-primary" type="button">SEARCH</button>
        </div>

        <div className="table-wrap">
          <table className="data-table" style={{ minWidth: '1000px' }}>
            <thead>
              <tr>
                <th>S.NO</th>
                <th>MEMBER ID</th>
                <th>NAME</th>
                <th>E-PIN</th>
                <th>PACKAGE</th>
                <th>JOINING AMOUNT</th>
                <th>KYC STATUS</th>
                <th>INCOME STATUS</th>
                <th>BLOCK STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10">Loading...</td>
                </tr>
              ) : visibleMembers.length > 0 ? visibleMembers.map((member) => (
                <tr key={`info-${member.memberId || member.sNo}`}>
                  <td>{member.sNo}</td>
                  <td>{member.memberId}</td>
                  <td>{member.name}</td>
                  <td>{member.epin}</td>
                  <td>{member.joiningPackage}</td>
                  <td>{member.joiningAmount > 0 ? `₹${member.joiningAmount}` : '---'}</td>
                  <td>
                    <span className={
                      member.kycStatus === 'APPROVED' ? 'member-status-active' :
                      member.kycStatus === 'REJECTED' || member.kycStatus === 'REJECT' ? 'member-status-inactive' :
                      'member-status-pending'
                    } style={member.kycStatus === 'PENDING' ? { backgroundColor: '#f59e0b', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' } : {}}>
                      {member.kycStatus || 'PENDING'}
                    </span>
                  </td>
                  <td>
                    <span className={member.incomeStatus === 'Inactive' ? 'member-status-inactive' : 'member-status-active'}>
                      {member.incomeStatus || 'Active'}
                    </span>
                  </td>
                  <td>
                    <span className={member.blockStatus === 'Block' ? 'member-status-inactive' : 'member-status-active'}>
                      {member.blockStatus || 'Unblock'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-primary" 
                      style={{ padding: '6px 14px', fontSize: '13px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center' }}
                      type="button"
                      disabled={actionLoading === member.memberId}
                      onClick={() => handleToggleBlock(member.memberId, member.blockStatus || 'Unblock')}
                    >
                      {actionLoading === member.memberId ? 'PROCESSING...' : (
                        member.blockStatus === 'Block' ? (
                          <>
                            <span style={{ marginRight: '6px', fontSize: '14px' }}>🔓</span>
                            UNBLOCK
                          </>
                        ) : (
                          <>
                            <span style={{ marginRight: '6px', fontSize: '14px' }}>🔒</span>
                            BLOCK
                          </>
                        )
                      )}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="10">No members found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer" style={{ justifyContent: 'space-between', marginTop: '12px' }}>
          <span style={{ fontSize: '0.95em', color: 'var(--text-muted)', fontWeight: '500', paddingLeft: '8px' }}>
            Total: {filteredMembers.length} members
          </span>
          <div className="pagination">
            <button className="page-btn">&laquo;</button>
            <button className="page-btn">&lsaquo;</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">4</button>
            <button className="page-btn">5</button>
            <button className="page-btn">&rsaquo;</button>
            <button className="page-btn">&raquo;</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MemberInformation;
