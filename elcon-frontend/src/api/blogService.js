import apiClient from './config';

// Blogs APIs
export const getBlogList = async () => {
  const response = await apiClient.get('/blogs');
  return response.data;
};

export const getBlogById = async (blogId) => {
  const response = await apiClient.get(`/blogs/${blogId}`);
  return response.data;
};

export const createBlog = async (payload) => {
  const response = await apiClient.post('/blogs', payload);
  return response.data;
};

export const updateBlog = async (blogId, payload) => {
  const response = await apiClient.put(`/blogs/${blogId}`, payload);
  return response.data;
};

export const deleteBlog = async (blogId) => {
  const response = await apiClient.delete(`/blogs/${blogId}`);
  return response.data;
};
