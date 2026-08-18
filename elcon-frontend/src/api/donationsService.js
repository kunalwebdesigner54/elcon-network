import apiClient from './config';

// Who should the logged-in user pay for a given upgrade level?
export const getDonationTarget = (level) =>
  apiClient.get(`/donations/target/${level}`).then((r) => r.data);

// Wallet-based upgrade (auto-confirmed, requires wallet balance)
export const upgradeMember = (level) =>
  apiClient.post('/donations/upgrade', { level }).then((r) => r.data);

// P2P direct-payment submission (pending admin approval)
export const submitDonation = (level, utrNumber, paymentProof = '') =>
  apiClient
    .post('/donations/submit', { level, utrNumber, paymentProof })
    .then((r) => r.data);

// Logged-in user's sent + received donations
export const getMyDonations = () =>
  apiClient.get('/donations/my').then((r) => r.data);

// Donation stats (admin or user scoped)
export const getDonationStats = () =>
  apiClient.get('/donations/stats').then((r) => r.data);

// Admin: all donations with optional filters
export const getAllDonations = (params = {}) =>
  apiClient.get('/donations', { params }).then((r) => r.data);

// Admin: approve or reject a pending donation
export const updateDonationStatus = (donationId, status, remark = '') =>
  apiClient
    .patch(`/donations/${donationId}/status`, { status, remark })
    .then((r) => r.data);

// Team tree for logged-in user (or any member for admin via ?memberId=)
export const getTeamTree = (memberId = '') =>
  apiClient
    .get('/members/team-tree', memberId ? { params: { memberId } } : {})
    .then((r) => r.data);
