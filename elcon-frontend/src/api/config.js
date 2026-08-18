import axios from 'axios';

const defaultApiBaseUrl = 'http://localhost:5000/api';

const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API || defaultApiBaseUrl,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
});

// ... rest of the code

apiClient.interceptors.request.use((config) => {
	const token = localStorage.getItem('token');

	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

export default apiClient;
