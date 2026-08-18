const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createSupportTicket,
  getMySupportTickets,
  getAllSupportTickets,
  updateSupportTicketStatus,
} = require('../controllers/supportTicketsController');

const router = express.Router();

router.use(protect);

router.post('/', createSupportTicket);
router.get('/me', getMySupportTickets);
router.get('/', authorize('admin'), getAllSupportTickets);
router.patch('/:ticketNo/status', authorize('admin'), updateSupportTicketStatus);

module.exports = router;