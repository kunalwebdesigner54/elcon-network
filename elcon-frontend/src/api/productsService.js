import apiClient from './config';

export const getPublicProducts = async (type) => {
  const response = await apiClient.get('/products', {
    params: type ? { type } : undefined,
  });

  return response.data;
};

export const getAdminProducts = async (type) => {
  const response = await apiClient.get('/products/admin/list', {
    params: type ? { type } : undefined,
  });

  return response.data;
};

export const getProductById = async (productId) => {
  const response = await apiClient.get(`/products/${productId}`);
  return response.data;
};

export const createAdminProduct = async (productData) => {
  const response = await apiClient.post('/products/admin', productData);
  return response.data;
};

export const updateAdminProduct = async (productId, productData) => {
  const response = await apiClient.put(`/products/admin/${productId}`, productData);
  return response.data;
};

export const deleteAdminProduct = async (productId) => {
  const response = await apiClient.delete(`/products/admin/${productId}`);
  return response.data;
};

export const getCart = async () => {
  const response = await apiClient.get('/cart');
  return response.data;
};

export const addCartItem = async (productId, quantity = 1) => {
  const response = await apiClient.post('/cart/items', { productId, quantity });
  return response.data;
};

export const updateCartItem = async (productId, quantity) => {
  const response = await apiClient.patch(`/cart/items/${productId}`, { quantity });
  return response.data;
};

export const removeCartItem = async (productId) => {
  const response = await apiClient.delete(`/cart/items/${productId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await apiClient.delete('/cart');
  return response.data;
};

export const checkoutCart = async (payload = {}) => {
  const response = await apiClient.post('/orders/checkout', payload);
  return response.data;
};

export const getOrders = async () => {
  const response = await apiClient.get('/orders');
  return response.data;
};

export const getOrderByNo = async (orderNo) => {
  const response = await apiClient.get(`/orders/${orderNo}`);
  return response.data;
};

export const getAdminOrders = async () => {
  const response = await apiClient.get('/admin/orders');
  return response.data;
};

export const updateOrderStatus = async (orderNo, payload) => {
  const response = await apiClient.patch(`/admin/orders/${orderNo}/status`, payload);
  return response.data;
};