import apiClient from './config';

export const createWithdrawalRequest = async (payload) => {
  const response = await apiClient.post('/withdrawals', payload);
  return response.data;
};

export const getMyWithdrawalSummary = async () => {
  const response = await apiClient.get('/withdrawals/summary');
  return response.data;
};

export const getMyWithdrawalHistory = async () => {
  const response = await apiClient.get('/withdrawals/me');
  return response.data;
};

export const createDepositRequest = async (payload) => {
  const response = await apiClient.post('/deposits', payload);
  return response.data;
};

export const getMyDepositHistory = async () => {
  const response = await apiClient.get('/deposits/me');
  return response.data;
};

export const getAdminWithdrawalRequests = async (status) => {
  const response = await apiClient.get('/withdrawals/admin', {
    params: status ? { status } : undefined,
  });
  return response.data;
};

export const updateWithdrawalRequestStatus = async (requestId, payload) => {
  const response = await apiClient.patch(`/withdrawals/${requestId}/status`, payload);
  return response.data;
};

export const getAdminDepositRequests = async (status) => {
  const response = await apiClient.get('/deposits', {
    params: status ? { status } : undefined,
  });
  return response.data;
};

export const updateDepositRequestStatus = async (orderNo, payload) => {
  const response = await apiClient.patch(`/deposits/${orderNo}/status`, payload);
  return response.data;
};