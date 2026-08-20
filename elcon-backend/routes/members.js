const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAdminKycRequests,
  updateKycStatus,
  updateBlockStatus,
  getAllMembersList,
  getMembersLocation,
  getMemberPerformance,
  getTeamTree,
} = require('../controllers/membersController');

const router = express.Router();

router.use(protect);

router.get('/kyc-requests', authorize('admin'), getAdminKycRequests);
router.patch('/kyc-requests/:memberId/status', authorize('admin'), updateKycStatus);
router.patch('/:memberId/block-status', authorize('admin'), updateBlockStatus);
router.get('/all-members', authorize('admin'), getAllMembersList);
router.get('/locations', authorize('admin'), getMembersLocation);
router.get('/performance', authorize('admin'), getMemberPerformance);
router.get('/team-tree', getTeamTree);

module.exports = router;