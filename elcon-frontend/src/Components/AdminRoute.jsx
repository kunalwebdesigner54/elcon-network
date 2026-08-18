import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import { getToken, getUser } from '../utils/auth';

function AdminRoute({ children }) {
	const [isAuthorized, setIsAuthorized] = useState(null);

	useEffect(() => {
		const token = getToken();
		const user = getUser();

		if (!token || !user) {
			setIsAuthorized(false);
			return;
		}

		if (user?.role === 'admin') {
			setIsAuthorized(true);
		} else {
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
