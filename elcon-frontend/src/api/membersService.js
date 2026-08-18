import apiClient from './config';

export const getAdminKycRequests = async () => {
  const response = await apiClient.get('/members/kyc-requests');
  return response.data;
};

export const updateAdminKycStatus = async (memberId, statusData) => {
  const response = await apiClient.patch(`/members/kyc-requests/${memberId}/status`, statusData);
  return response.data;
};

export const getAllMembersList = async () => {
  const response = await apiClient.get('/members/all-members');
  return response.data;
};

export const getMembersLocation = async () => {
  const response = await apiClient.get('/members/locations');
  return response.data;
};

export const getMemberPerformance = async () => {
  const response = await apiClient.get('/members/performance');
  return response.data;
};

export const submitKycRequest = async (kycData) => {
  const response = await apiClient.put('/profile/kyc-request', kycData);
  return response.data;
};