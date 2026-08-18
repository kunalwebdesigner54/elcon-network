import apiClient from './config';

// Admin: all coupons with optional filters
export const getAllCoupons = (params = {}) =>
  apiClient.get('/coupons', { params }).then((r) => r.data);

// User: their own coupons
export const getMyCoupons = (params = {}) =>
  apiClient.get('/coupons/my', { params }).then((r) => r.data);

// Create a coupon (admin)
export const createCoupon = (couponData) =>
  apiClient.post('/coupons', couponData).then((r) => r.data);

// Update coupon status (e.g., mark as used, expired)
export const updateCouponStatus = (couponId, status) =>
  apiClient.patch(`/coupons/${couponId}/status`, { status }).then((r) => r.data);

// Delete a coupon (admin)
export const deleteCoupon = (couponId) =>
  apiClient.delete(`/coupons/${couponId}`).then((r) => r.data);
