import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./AllMembersList.css";
import { getAllMembersList } from '../../../../api/membersService';
import { loginAsUser } from '../../../../api/authService';
import { formatDate } from '../../../../utils/dateFormatter';

const AllMembersList = () => {
  const [membersData, setMembersData] = useState([]);
  const initialFilters = {
    sponsorId: '',
    memberId: '',
    name: '',
    mobile: '',
    city: '',
    levelDepth: '',
    status: '',
    startDate: '',
    endDate: '',
  };
  const [filters, setFilters] = useState(initialFilters);
  const [pageSize, setPageSize] = useState('10');
  const [loading, setLoading] = useState(true);
  const [loginLoadingMember, setLoginLoadingMember] = useState(null);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [totalWalletBalance, setTotalWalletBalance] = useState(0);

  const loadMembers = async (currentPage = page, currentLimit = pageSize) => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: currentLimit,
        ...filters
      };
      const response = await getAllMembersList(params);
      setMembersData(response.data || []);
      setPagination(response.pagination || { total: 0, page: 1, limit: currentLimit, pages: 1 });
      setTotalWalletBalance(response.totalWalletBalance || 0);
    } catch (error) {
      setMembersData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers(page, pageSize);
  }, [page, pageSize]);

  const handleSearch = () => {
    if (page !== 1) {
      setPage(1);
    } else {
      loadMembers(1, pageSize);
    }
  };

  const handleFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setPageSize('10');
    setPage(1);
    // Setting state is async, so we manually call load with initial values
    const params = {
      page: 1,
      limit: '10',
      ...initialFilters
    };
    setLoading(true);
    getAllMembersList(params)
      .then(response => {
        setMembersData(response.data || []);
        setPagination(response.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
        setTotalWalletBalance(response.totalWalletBalance || 0);
      })
      .catch(() => setMembersData([]))
      .finally(() => setLoading(false));
  };

  const formatJoinDate = (joinDateRaw, fallbackDate) => {
    if (!joinDateRaw) return fallbackDate || '---';
    return formatDate(joinDateRaw);
  };

  // Removed client-side filteredMembers and visibleMembers
  // Data is now fetched directly from server with pagination

  const handleLoginAsUser = async (memberId) => {
    try {
      setLoginError('');
      setLoginLoadingMember(memberId);
      const response = await loginAsUser(memberId);
      if (response?.token) {
        const url = `/user/dashboard?impersonateToken=${encodeURIComponent(response.token)}&impersonateUser=${encodeURIComponent(JSON.stringify(response.user))}`;
        window.open(url, '_blank');
      } else {
        setLoginError('Unable to login to user account.');
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to login to user account.';
      setLoginError(message);
    } finally {
      setLoginLoadingMember(null);
    }
  };

  return (
    <div>
      <h1 className="page-title" style={{ fontSize: '42px', marginBottom: '14px' }}>All-Members-List</h1>

      <div className="panel" style={{ borderRadius: '28px', padding: '24px' }}>
       

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          <input className="text-input" style={{ maxWidth: '120px' }} placeholder="SPONSOR ID" value={filters.sponsorId} onChange={handleFilterChange('sponsorId')} />
          <input className="text-input" style={{ maxWidth: '120px' }} placeholder="MEMBER ID" value={filters.memberId} onChange={handleFilterChange('memberId')} />
          <input className="text-input" style={{ maxWidth: '140px' }} placeholder="NAME" value={filters.name} onChange={handleFilterChange('name')} />
          <input className="text-input" style={{ maxWidth: '130px' }} placeholder="MOBILE" value={filters.mobile} onChange={handleFilterChange('mobile')} />
          <input className="text-input" style={{ maxWidth: '110px' }} placeholder="CITY" value={filters.city} onChange={handleFilterChange('city')} />
          <input className="text-input" style={{ maxWidth: '80px' }} placeholder="LEVEL" value={filters.levelDepth} onChange={handleFilterChange('levelDepth')} />
          <select className="select-input" style={{ maxWidth: '98px' }} value={filters.status} onChange={handleFilterChange('status')}>
            <option value="">STATUS</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="IN-ACTIVE">IN-ACTIVE</option>
          </select>
          <input className="text-input" style={{ maxWidth: '120px' }} placeholder="START DATE" type="date" value={filters.startDate} onChange={handleFilterChange('startDate')} />
          <input className="text-input" style={{ maxWidth: '110px' }} placeholder="END DATE" type="date" value={filters.endDate} onChange={handleFilterChange('endDate')} />
          <select className="select-input" style={{ maxWidth: '84px' }} value={pageSize} onChange={(event) => { setPageSize(event.target.value); setPage(1); }}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="btn-primary" type="button" onClick={handleSearch}>SEARCH</button>
          <button className="btn-outline" type="button" onClick={handleReset} style={{ borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}>RESET</button>
        </div>

        {loginError && (
          <div style={{ color: '#d32f2f', marginBottom: '12px' }}>{loginError}</div>
        )}
        <div className="table-wrap">
          <table className="data-table" style={{ minWidth: '1400px' }}>
            <thead>
              <tr>
                <th>S.NO</th>
                <th>SPONSOR ID</th>
                <th>MEMBER ID</th>
                <th>NAME</th>
                <th>MOBILE</th>
                <th>JOIN DATE</th>
                <th>DIRECTS</th>
                <th>UPGRADE</th>
                <th>LEVEL DEPTH</th>
                <th>CITY</th>
                <th>STATUS</th>
                <th>PASSWORD</th>
                <th>TRAS.PASSWORD</th>
                <th>WALLET</th>
                <th>ACTION</th>
                <th>LOGIN</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="15">Loading...</td>
                </tr>
              ) : membersData.length > 0 ? membersData.map((member) => (
                <tr key={member.sNo}>
                  <td>{member.sNo}</td>
                  <td>{member.sponsorId}</td>
                  <td>{member.memberId}</td>
                  <td>{member.name}</td>
                  <td>{member.mobile}</td>
                  <td>{formatJoinDate(member.joinDateRaw, member.joinDate)}</td>
                  <td>{member.directCount || 0}</td>
                  <td>{member.upgradeLevel || 0}</td>
                  <td>{member.levelDepth}</td>
                  <td>{member.city}</td>
                  <td>
                    <span className={member.status === 'IN-ACTIVE' ? 'member-status-inactive' : 'member-status-active'}>
                      {member.status}
                    </span>
                  </td>
                  <td>{member.password}</td>
                  <td>{member.transPassword}</td>
                  <td>{member.wallet}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        className="action-icon-btn edit" 
                        title="Edit Profile"
                        onClick={() => navigate(`/members/edit-profile/${member.memberId}`)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button className="action-icon-btn status" title="Active/Inactive">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      </button>
                      <button className="action-icon-btn wallet" title="Credit/Debit Wallet">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
                      </button>
                    </div>
                  </td>
                  <td>
                    <button
                      className="login-btn"
                      type="button"
                      disabled={loginLoadingMember === member.memberId}
                      onClick={() => handleLoginAsUser(member.memberId)}
                    >
                      {loginLoadingMember === member.memberId ? 'LOGGING IN...' : 'LOGIN'}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="15">No members found</td>
                </tr>
              )}
              {!loading && membersData.length > 0 && (
                <tr className="report-total-row">
                  <td colSpan="13" style={{ textAlign: 'end', fontWeight: 700 }}>Total Wallet Balance</td>
                  <td style={{ fontWeight: 700 }}>₹{Number(totalWalletBalance || 0).toFixed(2)}</td>
                  <td colSpan="2" />
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer" style={{ justifyContent: 'space-between', marginTop: '12px', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.95em', color: 'var(--text-muted)', fontWeight: '500', paddingLeft: '8px' }}>
            Total: {pagination.total} members
          </span>
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>&laquo;</button>
            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>&lsaquo;</button>
            
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let start = Math.max(1, page - 2);
              if (start + 4 > pagination.pages) start = Math.max(1, pagination.pages - 4);
              const pageNum = start + i;
              if (pageNum > pagination.pages) return null;
              
              return (
                <button 
                  key={pageNum} 
                  className={`page-btn ${page === pageNum ? 'active' : ''}`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button className="page-btn" onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages || pagination.pages === 0}>&rsaquo;</button>
            <button className="page-btn" onClick={() => setPage(pagination.pages)} disabled={page === pagination.pages || pagination.pages === 0}>&raquo;</button>
          </div>
        </div>



      </div>
    </div>
  );
};

export default AllMembersList;
