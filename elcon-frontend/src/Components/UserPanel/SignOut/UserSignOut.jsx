import { useNavigate } from 'react-router-dom';
import '../Common/UserLayout.css';
import './UserSignOut.css';

function UserSignOut() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // If it's an impersonated session, only clear sessionStorage and try to close tab
    if (sessionStorage.getItem('impersonateToken')) {
      sessionStorage.removeItem('impersonateToken');
      sessionStorage.removeItem('impersonateUser');
      window.close(); // Only works if opened by script
      navigate('/user-login', { replace: true });
    } else {
      // Normal user logout
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      navigate('/user-login', { replace: true });
    }
  };

  return (
    <div>
      <h1 className="user-page-title">Sign Out</h1>
      <div className="user-panel user-signout-panel">
        <p>Click button below to logout from user panel.</p>
        <button className="user-btn user-signout-btn" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default UserSignOut;
