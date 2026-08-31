const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getEpinRequests,
  createEpinRequest,
  updateEpinRequestStatus,
  getEpins,
  generateEpins,
  updateEpinStatus,
  transferEpin,
  getTransferHistory,
  getFranchises,
  createOrUpdateFranchise,
  deleteFranchise,
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  getFranchiseDeliveryReport,
  verifyJoiningPackageDelivery,
  getFranchiseStock
} = require('../controllers/epinsController');

const router = express.Router();

router.use(protect);

router.get('/requests', authorize('admin'), getEpinRequests);
router.post('/requests', createEpinRequest);
router.patch('/requests/:requestId/status', authorize('admin'), updateEpinRequestStatus);

router.get('/', getEpins);
router.post('/generate', generateEpins);
router.patch('/:epinNo/status', updateEpinStatus);
router.post('/:epinNo/transfer', transferEpin);
router.get('/transfers', getTransferHistory);

router.get('/franchises', getFranchises);
router.post('/franchises', authorize('admin'), createOrUpdateFranchise);
router.put('/franchises/:franchiseId', authorize('admin'), createOrUpdateFranchise);
router.delete('/franchises/:franchiseId', authorize('admin'), deleteFranchise);

router.get('/packages', getPackages);
router.post('/packages', authorize('admin'), createPackage);
router.put('/packages/:id', authorize('admin'), updatePackage);
router.delete('/packages/:id', authorize('admin'), deletePackage);

router.get('/franchise-delivery-report', getFranchiseDeliveryReport);
router.post('/franchise-verify-delivery', verifyJoiningPackageDelivery);
router.get('/franchise-stock', getFranchiseStock);

module.exports = router;