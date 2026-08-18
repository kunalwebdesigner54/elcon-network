import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./AllMembersList.css";
import { getAllMembersList } from '../../../../api/membersService';
import { loginAsUser } from '../../../../api/authService';

const AllMembersList = () => {
  const [membersData, setMembersData] = useState([]);
  const [filters, setFilters] = useState({
    sponsorId: '',
    memberId: '',
    name: '',
    mobile: '',
    city: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [pageSize, setPageSize] = useState('10');
  const [loading, setLoading] = useState(true);
  const [loginLoadingMember, setLoginLoadingMember] = useState(null);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
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

    loadMembers();
  }, []);

  const handleFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const filteredMembers = useMemo(() => {
    return membersData.filter((member) => {
      const joinDateValue = member.joinDateRaw ? new Date(member.joinDateRaw).toISOString().slice(0, 10) : '';

      const bySponsor = !filters.sponsorId || member.sponsorId.toLowerCase().includes(filters.sponsorId.toLowerCase());
      const byMember = !filters.memberId || member.memberId.toLowerCase().includes(filters.memberId.toLowerCase());
      const byName = !filters.name || member.name.toLowerCase().includes(filters.name.toLowerCase());
      const byMobile = !filters.mobile || member.mobile.toLowerCase().includes(filters.mobile.toLowerCase());
      const byCity = !filters.city || member.city.toLowerCase().includes(filters.city.toLowerCase());
      const byStatus = !filters.status || member.status === filters.status;
      const byStartDate = !filters.startDate || joinDateValue >= filters.startDate;
      const byEndDate = !filters.endDate || joinDateValue <= filters.endDate;

      return bySponsor && byMember && byName && byMobile && byCity && byStatus && byStartDate && byEndDate;
    });
  }, [filters, membersData]);

  const visibleMembers = filteredMembers.slice(0, Number(pageSize));

  const handleLoginAsUser = async (memberId) => {
    try {
      setLoginError('');
      setLoginLoadingMember(memberId);
      const response = await loginAsUser(memberId);
      if (response?.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        navigate('/user/dashboard', { replace: true });
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
          <input className="text-input" style={{ maxWidth: '80px' }} placeholder="LEVEL" />
          <select className="select-input" style={{ maxWidth: '98px' }} value={filters.status} onChange={handleFilterChange('status')}>
            <option value="">STATUS</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="IN-ACTIVE">IN-ACTIVE</option>
          </select>
          <input className="text-input" style={{ maxWidth: '120px' }} placeholder="START DATE" type="date" value={filters.startDate} onChange={handleFilterChange('startDate')} />
          <input className="text-input" style={{ maxWidth: '110px' }} placeholder="END DATE" type="date" value={filters.endDate} onChange={handleFilterChange('endDate')} />
          <select className="select-input" style={{ maxWidth: '84px' }} value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button className="btn-primary" type="button">SEARCH</button>
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
                <th>J.LEVEL</th>
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
                  <td colSpan="14">Loading...</td>
                </tr>
              ) : visibleMembers.length > 0 ? visibleMembers.map((member) => (
                <tr key={member.sNo}>
                  <td>{member.sNo}</td>
                  <td>{member.sponsorId}</td>
                  <td>{member.memberId}</td>
                  <td>{member.name}</td>
                  <td>{member.mobile}</td>
                  <td>{member.joinDate}</td>
                  <td>{member.jLevel}</td>
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
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button className="action-icon-btn edit" title="Edit Profile" style={{ backgroundColor: '#4ec3e0', border: 'none', color: '#fff' }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25z" fill="#fff"/><path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#fff"/></svg>
                      </button>
                      <button className="action-icon-btn status" title="Active/Inactive" style={{ backgroundColor: '#4caf50', border: 'none', color: '#fff' }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><polyline points="20 6 9.5 17 4 11.5" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button className="action-icon-btn wallet" title="Credit/Debit Wallet" style={{ backgroundColor: '#00bcd4', border: 'none', color: '#fff' }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="9" y="4" width="6" height="16" rx="3" fill="#fff"/><rect x="4" y="9" width="16" height="6" rx="3" fill="#fff"/></svg>
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
                  <td colSpan="14">No members found</td>
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

      </div>
    </div>
  );
};

export default AllMembersList;