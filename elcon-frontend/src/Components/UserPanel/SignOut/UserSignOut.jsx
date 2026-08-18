import { useNavigate } from 'react-router-dom';
import '../Common/UserLayout.css';
import './UserSignOut.css';

function UserSignOut() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="user-page-title">Sign Out</h1>
      <div className="user-panel user-signout-panel">
        <p>Click button below to logout from user panel.</p>
        <button className="user-btn user-signout-btn" onClick={() => navigate('/user-login', { replace: true })}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default UserSignOut;
