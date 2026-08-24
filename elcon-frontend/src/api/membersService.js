import apiClient from './config';

export const getAdminKycRequests = async (params = {}) => {
  const response = await apiClient.get('/members/kyc-requests', { params });
  return response.data;
};

export const updateAdminKycStatus = async (memberId, statusData) => {
  const response = await apiClient.patch(`/members/kyc-requests/${memberId}/status`, statusData);
  return response.data;
};

export const getAllMembersList = async (params = {}) => {
  const response = await apiClient.get('/members/all-members', { params });
  return response.data;
};

export const updateBlockStatus = async (memberId, isBlocked) => {
  const response = await apiClient.patch(`/members/${memberId}/block-status`, { isBlocked });
  return response.data;
};

export const getMembersLocation = async (params = {}) => {
  const response = await apiClient.get('/members/locations', { params });
  return response.data;
};

export const getMemberPerformance = async () => {
  const response = await apiClient.get('/members/performance');
  return response.data;
};

export const getLevelIncomeReports = async (params = {}) => {
  const response = await apiClient.get('/level-income/reports', { params });
  return response.data;
};

export const submitKycRequest = async (kycData) => {
  const response = await apiClient.put('/profile/kyc-request', kycData);
  return response.data;
};

export const getTreeNode = async (memberId) => {
  const params = memberId ? { memberId } : {};
  const response = await apiClient.get('/members/tree-node', { params });
  return response.data;
};