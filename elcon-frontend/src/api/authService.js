import apiClient from './config';

export const registerUser = async (userData) => {
	const response = await apiClient.post('/auth/register', userData);
	return response.data;
};

export const loginUser = async (credentials) => {
	const response = await apiClient.post('/auth/login', credentials);
	return response.data;
};

export const loginAsUser = async (memberId) => {
	const response = await apiClient.post('/auth/admin-login-user', { memberId });
	return response.data;
};

export const getSponsorDetails = async (sponsorId) => {
	const response = await apiClient.get(`/auth/sponsor/${sponsorId}`);
	return response.data;
};

// Profile Services
export const getProfile = async () => {
	const response = await apiClient.get('/profile/me');
	return response.data;
};

export const updateProfile = async (profileData) => {
	const response = await apiClient.put('/profile/update', profileData);
	return response.data;
};

export const updateBankDetails = async (bankData) => {
	const response = await apiClient.put('/profile/bank-details', bankData);
	return response.data;
};

export const updatePaymentDetails = async (paymentData) => {
	const response = await apiClient.put('/profile/payment-details', paymentData);
	return response.data;
};

export const updateNomineeDetails = async (nomineeData) => {
	const response = await apiClient.put('/profile/nominee-details', nomineeData);
	return response.data;
};

export const changePassword = async (passwordData) => {
	const response = await apiClient.put('/profile/change-password', passwordData);
	return response.data;
};

export const updateTransactionPassword = async (passwordData) => {
	const response = await apiClient.put('/profile/transaction-password', passwordData);
	return response.data;
};

