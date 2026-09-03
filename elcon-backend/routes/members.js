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
  getTreeNode,
  getMemberProfile,
  updateMemberProfile,
  getMyDatewiseIncome,
  getMyDailyPayout,
} = require('../controllers/membersController');

const router = express.Router();

router.use(protect);

router.get('/kyc-requests', authorize('admin'), getAdminKycRequests);
router.patch('/kyc-requests/:memberId/status', authorize('admin'), updateKycStatus);
router.patch('/:memberId/block-status', authorize('admin'), updateBlockStatus);
router.get('/all-members', authorize('admin'), getAllMembersList);
router.get('/locations', authorize('admin'), getMembersLocation);
router.get('/performance', authorize('admin'), getMemberPerformance);
router.get('/my-datewise-income', getMyDatewiseIncome);
router.get('/my-daily-payout', getMyDailyPayout);
router.get('/team-tree', getTeamTree);
router.get('/tree-node', getTreeNode);
router.get('/profile/:memberId', authorize('admin'), getMemberProfile);
router.put('/profile/:memberId', authorize('admin'), updateMemberProfile);

module.exports = router;