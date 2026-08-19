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
                      <button className="action-icon-btn edit" title="Edit Profile">
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