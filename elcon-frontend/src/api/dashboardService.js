import apiClient from './config';

export const getAdminDashboard = async () => {
  const response = await apiClient.get('/dashboard/admin');
  return response.data;
};

export const getUserDashboard = async () => {
  const response = await apiClient.get('/dashboard/user');
  return response.data;
};

export const getAdminFullDashboard = async () => {
  const response = await apiClient.get('/dashboard/admin/full');
  return response.data;
};
