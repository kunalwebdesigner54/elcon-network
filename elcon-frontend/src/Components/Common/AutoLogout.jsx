import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function AutoLogout({ timeoutMinutes = 15 }) {
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId;
    
    const logoutUser = () => {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (token) {
        sessionStorage.clear();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        Swal.fire({
          title: 'Session Expired',
          text: 'You have been automatically logged out due to inactivity.',
          icon: 'warning',
          confirmButtonText: 'Login Again',
          allowOutsideClick: false
        }).then(() => {
          navigate('/login');
        });
      }
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (token) {
        timeoutId = setTimeout(logoutUser, timeoutMinutes * 60 * 1000);
      }
    };

    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    
    events.forEach(e => window.addEventListener(e, resetTimer));

    // Initialize timer on mount
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [navigate, timeoutMinutes]);

  return null;
}
