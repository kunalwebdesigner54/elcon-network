const mongoose = require('mongoose');
const User = require('../models/User');
const Epin = require('../models/Epin');
const EpinRequest = require('../models/EpinRequest');
const EpinTransfer = require('../models/EpinTransfer');
const EpinFranchise = require('../models/EpinFranchise');

const getUserIdentifiers = (req) => [req.user?.memberId, req.user?.epin, req.user?.id]
  .map((value) => String(value || '').trim())
  .filter(Boolean);

const isAdmin = (req) => req.user?.role === 'admin';

const formatDate = (date = new Date()) => new Date(date).toLocaleString('en-IN', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
});

const mapEpin = (doc, index) => ({
  id: index + 1,
  epinName: doc.epinName,
  epin: doc.epinNo,
  cost: String(doc.cost),
  genDate: formatDate(doc.createdAt),
  genBy: doc.generatedBy,
  currentOwner: doc.currentOwner,
  status: doc.status,
  usedBy: doc.usedBy || '-',
  usedDate: doc.usedDate || '-',
});

const mapRequest = (doc, index) => ({
  _id: String(doc._id),
  id: index + 1,
  clientId: doc.clientId,
  name: doc.name,
  packageCost: doc.packageCost,
  qty: doc.qty,
  paidAmount: Number(doc.paidAmount).toFixed(2),
  mobile: doc.mobile,
  date: formatDate(doc.createdAt).split(',')[0],
  status: doc.status,
});

exports.getEpinRequests = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Not authorized to access ePin requests' });
    }
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const rows = await EpinRequest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, requests: rows.map(mapRequest) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createEpinRequest = async (req, res) => {
  try {
    const payload = req.body || {};
    const request = await EpinRequest.create({
      clientId: payload.clientId || req.user?.memberId || req.user?.epin || 'UNKNOWN',
      name: payload.name || req.user?.name || 'Member',
      packageCost: payload.packageCost || 'Activation-10.00',
      qty: Number(payload.qty || payload.numberOfEpins || 1),
      paidAmount: Number(payload.paidAmount || payload.totalPaidAmount || 0),
      mobile: payload.mobile || req.user?.contactNo || '-',
      status: 'Pending',
    });

    res.status(201).json({ success: true, request: mapRequest(request, 0) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEpinRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ success: false, message: 'Invalid request id' });
    }

    const request = await EpinRequest.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    request.status = req.body.status || request.status;
    await request.save();
    res.json({ success: true, request: mapRequest(request, 0) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEpins = async (req, res) => {
  try {
    const { status, generatedBy, currentOwner, epin } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (epin) filter.epinNo = new RegExp(epin, 'i');
    if (isAdmin(req)) {
      if (generatedBy) filter.generatedBy = generatedBy;
      if (currentOwner) filter.currentOwner = currentOwner;
    } else {
      const identifiers = getUserIdentifiers(req);
      if (!identifiers.length) {
        return res.status(403).json({ success: false, message: 'Not authorized to view ePins' });
      }
      filter.$or = [
        { generatedBy: { $in: identifiers } },
        { currentOwner: { $in: identifiers } },
        { usedBy: { $in: identifiers } },
        { deletedBy: { $in: identifiers } },
      ];
    }
    const rows = await Epin.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, epins: rows.map(mapEpin) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateEpins = async (req, res) => {
  try {
    const qty = Math.max(1, Number(req.body.qty || req.body.numberOfEpins || 1));
    const epinName = String(req.body.epinName || 'Activation').trim();
    const identifiers = getUserIdentifiers(req);
    if (!isAdmin(req)) {
      if (!identifiers.length) {
        return res.status(403).json({ success: false, message: 'Not authorized to generate ePins' });
      }

      const transactionPassword = req.body.transactionPassword;
      if (!transactionPassword) {
        return res.status(400).json({ success: false, message: 'Transaction password is required' });
      }
      
      const user = await User.findById(req.user.id).select('+password +transactionPassword');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isPasswordValid = user.transactionPassword
        ? await user.matchTransactionPassword(transactionPassword)
        : await user.matchPassword(transactionPassword);

      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Transaction password is incorrect' });
      }
    }
    const generatedBy = isAdmin(req)
      ? String(req.body.generatedBy || req.user?.memberId || req.user?.epin || 'ADMIN').trim()
      : identifiers[0];
    const currentOwner = String((isAdmin(req) ? req.body.currentOwner : undefined) || generatedBy).trim();
    const cost = Number(req.body.cost || 10);

    const created = [];
    for (let index = 0; index < qty; index += 1) {
      let epinNo = '';
      let exists = true;
      while (exists) {
        epinNo = `EPR${Math.floor(1000000 + Math.random() * 9000000)}`;
        // eslint-disable-next-line no-await-in-loop
        exists = Boolean(await Epin.findOne({ epinNo }));
      }
      // eslint-disable-next-line no-await-in-loop
      const doc = await Epin.create({ epinName, epinNo, cost, generatedBy, currentOwner, status: 'Unused', usedBy: '-', usedDate: '-', deletedBy: '-', deletedDate: '-', deletedReason: '-' });
      created.push(mapEpin(doc, created.length));
    }

    res.status(201).json({ success: true, epins: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEpinStatus = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update ePin status' });
    }
    const epin = await Epin.findOne({ epinNo: req.params.epinNo });
    if (!epin) return res.status(404).json({ success: false, message: 'ePin not found' });
    const status = String(req.body.status || '').trim();
    if (status) epin.status = status;
    if (status === 'Used') {
      epin.usedBy = req.body.usedBy || epin.usedBy || '-';
      epin.usedDate = req.body.usedDate || formatDate();
    }
    if (status === 'Deleted') {
      epin.deletedBy = req.body.deletedBy || req.user?.memberId || req.user?.epin || '-';
      epin.deletedDate = req.body.deletedDate || formatDate();
      epin.deletedReason = req.body.deletedReason || 'Manual delete by admin';
    }
    await epin.save();
    res.json({ success: true, epin: mapEpin(epin, 0) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.transferEpin = async (req, res) => {
  try {
    const epin = await Epin.findOne({ epinNo: req.params.epinNo });
    if (!epin) return res.status(404).json({ success: false, message: 'ePin not found' });
    const identifiers = getUserIdentifiers(req);
    if (!isAdmin(req)) {
      if (!identifiers.includes(epin.currentOwner)) {
        return res.status(403).json({ success: false, message: 'You can only transfer your own ePins' });
      }

      const transactionPassword = req.body.transactionPassword;
      if (!transactionPassword) {
        return res.status(400).json({ success: false, message: 'Transaction password is required' });
      }

      const user = await User.findById(req.user.id).select('+password +transactionPassword');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isPasswordValid = user.transactionPassword
        ? await user.matchTransactionPassword(transactionPassword)
        : await user.matchPassword(transactionPassword);

      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Transaction password is incorrect' });
      }
    }
    const toMember = String(req.body.toMember || '').trim();
    if (!toMember) {
      return res.status(400).json({ success: false, message: 'toMember is required' });
    }
    const targetUser = await User.findOne({ memberId: toMember });
    if (!targetUser && toMember.toUpperCase() !== 'ADMIN') {
      return res.status(404).json({ success: false, message: 'Target member not found' });
    }
    const transfer = await EpinTransfer.create({
      epinNo: epin.epinNo,
      fromMember: String(isAdmin(req) ? req.body.fromMember || epin.currentOwner : epin.currentOwner).trim(),
      toMember,
      amount: Number(req.body.amount || epin.cost || 0),
      status: String(req.body.status || 'Success').trim(),
    });
    epin.currentOwner = transfer.toMember;
    epin.status = req.body.status === 'Pending' ? 'Unused' : epin.status;
    await epin.save();
    res.status(201).json({ success: true, transfer: { id: transfer._id, epin: transfer.epinNo, fromMember: transfer.fromMember, toMember: transfer.toMember, transferDate: formatDate(transfer.createdAt), amount: Number(transfer.amount).toFixed(2), status: transfer.status } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTransferHistory = async (req, res) => {
  try {
    const transfers = await EpinTransfer.find().sort({ createdAt: -1 });
    if (isAdmin(req)) {
      res.json({ success: true, transfers: transfers.map((doc, index) => ({ id: index + 1, epin: doc.epinNo, fromMember: doc.fromMember, toMember: doc.toMember, transferDate: formatDate(doc.createdAt), amount: Number(doc.amount).toFixed(2), status: doc.status })) });
      return;
    }

    const identifiers = getUserIdentifiers(req);
    if (!identifiers.length) {
      return res.status(403).json({ success: false, message: 'Not authorized to view transfer history' });
    }

    const rows = transfers
      .filter((doc) => identifiers.includes(doc.fromMember) || identifiers.includes(doc.toMember))
      .map((doc, index) => ({ id: index + 1, epin: doc.epinNo, fromMember: doc.fromMember, toMember: doc.toMember, transferDate: formatDate(doc.createdAt), amount: Number(doc.amount).toFixed(2), status: doc.status }));

    res.json({ success: true, transfers: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFranchises = async (req, res) => {
  try {
    const filter = isAdmin(req) ? {} : { status: 'SHOWING' };
    const rows = await EpinFranchise.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, franchises: rows.map((doc, index) => ({ id: index + 1, franchiseId: doc.franchiseId, name: doc.franchiseName, upi: doc.upiId, whatsapp: doc.whatsappNo, city: doc.city, stock: doc.stock, status: doc.status })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createOrUpdateFranchise = async (req, res) => {
  try {
    const payload = req.body || {};
    const franchiseId = String(payload.franchiseId || payload.id || '').trim();
    if (!franchiseId) return res.status(400).json({ success: false, message: 'franchiseId is required' });
    const franchise = await EpinFranchise.findOneAndUpdate(
      { franchiseId },
      {
        franchiseName: payload.franchiseName || payload.name || 'Franchise',
        upiId: payload.upiId || payload.upi || '-',
        whatsappNo: payload.whatsappNo || payload.whatsapp || '-',
        city: payload.city || '-',
        stock: Number(payload.stock || 0),
        status: payload.status || 'SHOWING',
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ success: true, franchise: { franchiseId: franchise.franchiseId, name: franchise.franchiseName, upi: franchise.upiId, whatsapp: franchise.whatsappNo, city: franchise.city, stock: franchise.stock, status: franchise.status } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFranchise = async (req, res) => {
  try {
    const franchise = await EpinFranchise.findOne({ franchiseId: req.params.franchiseId });
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }

    franchise.status = 'HIDDEN';
    await franchise.save();

    res.json({
      success: true,
      franchise: {
        franchiseId: franchise.franchiseId,
        name: franchise.franchiseName,
        upi: franchise.upiId,
        whatsapp: franchise.whatsappNo,
        city: franchise.city,
        stock: franchise.stock,
        status: franchise.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};