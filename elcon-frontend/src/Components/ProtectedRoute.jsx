import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import { getToken } from '../utils/auth';

function ProtectedRoute({ children }) {
	const [isAuthorized, setIsAuthorized] = useState(null);

	useEffect(() => {
		const token = getToken();
		if (!token) {
			setIsAuthorized(false);
		} else {
			setIsAuthorized(true);
		}
	}, []);

	if (isAuthorized === null) {
		return null; // Loading state - prevent flash
	}

	if (isAuthorized === false) {
		return <Navigate to="/login" replace />;
	}

	return children;
}

export default ProtectedRoute;
