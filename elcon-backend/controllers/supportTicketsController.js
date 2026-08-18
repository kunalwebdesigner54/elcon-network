const SupportTicket = require('../models/SupportTicket');

const buildTicketNo = async () => {
  let ticketNo = '';
  let exists = true;

  while (exists) {
    const suffix = Math.floor(10000000 + Math.random() * 90000000);
    ticketNo = `TKT${suffix}`;
    exists = Boolean(await SupportTicket.findOne({ ticketNo }));
  }

  return ticketNo;
};

const formatTicket = (ticket, index = 0) => ({
  sNo: index + 1,
  ticketNo: ticket.ticketNo,
  memberId: ticket.memberId,
  memberName: ticket.memberName,
  subject: ticket.subject,
  message: ticket.message,
  createdDate: ticket.createdAt,
  createdDateLabel: ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('en-GB') : '---',
  status: ticket.status,
  remark: ticket.adminRemark || '---',
});

exports.createSupportTicket = async (req, res) => {
  try {
    const subject = String(req.body.subject || '').trim();
    const message = String(req.body.message || '').trim();

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }

    const ticketNo = await buildTicketNo();
    const ticket = await SupportTicket.create({
      ticketNo,
      userId: req.user.id,
      memberId: req.user.memberId || '---',
      memberName: req.user.name || '---',
      subject,
      message,
    });

    res.status(201).json({ success: true, message: 'Support ticket created successfully', data: formatTicket(ticket) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMySupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tickets.map((ticket, index) => formatTicket(ticket, index)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tickets.map((ticket, index) => formatTicket(ticket, index)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSupportTicketStatus = async (req, res) => {
  try {
    const { ticketNo } = req.params;
    const status = String(req.body.status || '').trim();
    const adminRemark = String(req.body.adminRemark || '').trim();

    if (!['Open', 'In Progress', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const ticket = await SupportTicket.findOne({ ticketNo });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    ticket.status = status;
    ticket.adminRemark = adminRemark || ticket.adminRemark;
    ticket.reviewedBy = req.user.id;
    ticket.reviewedAt = new Date();
    await ticket.save();

    res.status(200).json({ success: true, message: 'Support ticket updated successfully', data: formatTicket(ticket) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};