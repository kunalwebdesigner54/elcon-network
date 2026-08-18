import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

function AdminRoute({ children }) {
	const [isAuthorized, setIsAuthorized] = useState(null);

	useEffect(() => {
		const token = localStorage.getItem('token');
		const storedUser = localStorage.getItem('user');

		if (!token || !storedUser) {
			setIsAuthorized(false);
			return;
		}

		try {
			const user = JSON.parse(storedUser);
			if (user?.role === 'admin') {
				setIsAuthorized(true);
			} else {
				setIsAuthorized(false);
			}
		} catch (error) {
			setIsAuthorized(false);
		}
	}, []);

	if (isAuthorized === null) {
		return null; // Loading state - prevent flash
	}

	if (isAuthorized === false) {
		return <Navigate to="/admin/login" replace />;
	}

	return children;
}

export default AdminRoute;
