import apiClient from './config';

export const getCategories = async () => {
  const response = await apiClient.get('/categories');
  return response.data;
};

export const addCategory = async (categoryData) => {
  const response = await apiClient.post('/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await apiClient.put(`/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await apiClient.delete(`/categories/${id}`);
  return response.data;
};
