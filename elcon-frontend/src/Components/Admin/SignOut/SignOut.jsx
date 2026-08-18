import { useNavigate } from 'react-router-dom';
import './SignOut.css';

function SignOut() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    navigate('/admin-login', { replace: true });
  };

  return (
    <div>
      <h1 className="page-title">Sign Out</h1>
      <div className="panel signout-panel">
        <p>You are currently in demo mode.</p>
        <button className="btn-primary signout-button" onClick={handleSignOut}>Sign Out</button>
      </div>
    </div>
  );
}

export default SignOut;
