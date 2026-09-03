const mongoose = require('mongoose');
const User = require('../models/User');
const Epin = require('../models/Epin');
const EpinRequest = require('../models/EpinRequest');
const EpinTransfer = require('../models/EpinTransfer');
const EpinFranchise = require('../models/EpinFranchise');
const EpinPackage = require('../models/EpinPackage');

const getUserIdentifiers = (req) => [req.user?.memberId, req.user?.epin, req.user?.id]
  .map((value) => String(value || '').trim())
  .filter(Boolean);

const isAdmin = (req) => req.user?.role === 'admin';

const formatDate = (date = new Date()) => new Date(date).toLocaleString('en-IN', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
});

const unusedStockMapForOwners = async (ownerIds) => {
  const ids = [...new Set((ownerIds || []).map((id) => String(id || '').trim()).filter(Boolean))];
  if (!ids.length) return {};

  const ownerKeys = ids.map((id) => id.toUpperCase());
  const stockCounts = await Epin.aggregate([
    { $match: { status: 'Unused' } },
    {
      $addFields: {
        ownerKey: {
          $toUpper: { $trim: { input: { $ifNull: ['$currentOwner', ''] } } },
        },
      },
    },
    { $match: { ownerKey: { $in: ownerKeys } } },
    { $group: { _id: '$ownerKey', count: { $sum: 1 } } },
  ]);

  return stockCounts.reduce((map, item) => {
    map[item._id] = item.count;
    return map;
  }, {});
};

const countUnusedEpinsForOwner = async (ownerId) => {
  const map = await unusedStockMapForOwners([ownerId]);
  return map[String(ownerId || '').trim().toUpperCase()] || 0;
};

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
  remark: doc.remark || '-',
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
    const baseFilter = {};
    if (!isAdmin(req)) {
      const identifiers = getUserIdentifiers(req);
      if (!identifiers.length) {
        return res.status(403).json({ success: false, message: 'Not authorized to view ePins' });
      }
      baseFilter.$or = [
        { currentOwner: { $in: identifiers } },
        { usedBy: { $in: identifiers } },
        { deletedBy: { $in: identifiers } },
      ];
    }

    const [available, used] = await Promise.all([
      Epin.countDocuments({ ...baseFilter, status: 'Unused' }),
      Epin.countDocuments({ ...baseFilter, status: 'Used' }),
    ]);

    const filter = { ...baseFilter };
    if (status) filter.status = status;
    if (epin) filter.epinNo = new RegExp(epin, 'i');
    if (isAdmin(req)) {
      if (generatedBy) filter.generatedBy = generatedBy;
      if (currentOwner) filter.currentOwner = currentOwner;
    }

    const rows = await Epin.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, epins: rows.map(mapEpin), counts: { available, used } });
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

      const user = await User.findById(req.user.id).select('+password +transactionPassword walletBalance');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isPasswordValid = user.transactionPassword
        ? await user.matchTransactionPassword(transactionPassword)
        : await user.matchPassword(transactionPassword);

      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Transaction password is incorrect' });
      }

      const packageDocForCheck = await EpinPackage.findOne({ packageName: epinName, isActive: true });
      const costForCheck = packageDocForCheck ? packageDocForCheck.price : Number(req.body.cost || 10);
      const totalCost = qty * costForCheck;

      if ((user.walletBalance || 0) < totalCost) {
        return res.status(400).json({ success: false, message: 'Insufficient wallet balance to generate ePins' });
      }

      user.walletBalance -= totalCost;
      await user.save();
    }
    const generatedBy = isAdmin(req)
      ? String(req.body.generatedBy || req.user?.memberId || req.user?.epin || 'ADMIN').trim()
      : identifiers[0];
    const currentOwner = String((isAdmin(req) ? req.body.currentOwner : undefined) || generatedBy).trim();

    // Fetch actual package price if available to prevent manipulation
    const packageDoc = await EpinPackage.findOne({ packageName: epinName, isActive: true });
    const cost = packageDoc ? packageDoc.price : Number(req.body.cost || 10);
    const remark = String(req.body.remark || '-').trim();

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
      const doc = await Epin.create({ epinName, epinNo, cost, generatedBy, currentOwner, remark, status: 'Unused', usedBy: '-', usedDate: '-', deletedBy: '-', deletedDate: '-', deletedReason: '-' });
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

exports.transferEpins = async (req, res) => {
  try {
    const requestedEpins = Array.isArray(req.body.epinNos)
      ? req.body.epinNos
      : [req.params.epinNo || req.body.epinNo];
    const epinNos = [...new Set(requestedEpins.map((value) => String(value || '').trim()).filter(Boolean))];
    if (!epinNos.length) return res.status(400).json({ success: false, message: 'At least one ePin is required' });

    const epins = await Epin.find({ epinNo: { $in: epinNos }, status: 'Unused' });
    if (epins.length !== epinNos.length) {
      return res.status(400).json({ success: false, message: 'One or more selected ePins are unavailable' });
    }

    const identifiers = getUserIdentifiers(req);
    if (!isAdmin(req)) {
      const ownerKeys = identifiers.map((value) => value.toUpperCase());
      if (epins.some((epin) => !ownerKeys.includes(String(epin.currentOwner || '').toUpperCase()))) {
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
    const toMember = String(req.body.toMember || '').trim().toUpperCase();
    if (!toMember) {
      return res.status(400).json({ success: false, message: 'toMember is required' });
    }
    const targetUser = await User.findOne({ memberId: toMember });
    if (!targetUser && toMember.toUpperCase() !== 'ADMIN') {
      return res.status(404).json({ success: false, message: 'Target member not found' });
    }
    const status = String(req.body.status || 'Success').trim();
    const transfers = await EpinTransfer.insertMany(epins.map((epin) => ({
      epinNo: epin.epinNo,
      fromMember: String(isAdmin(req) ? req.body.fromMember || epin.currentOwner : epin.currentOwner).trim(),
      toMember,
      amount: Number(epin.cost || 0),
      status,
    })));
    await Epin.updateMany({ epinNo: { $in: epinNos } }, { $set: { currentOwner: toMember } });
    res.status(201).json({
      success: true,
      transfers: transfers.map((transfer) => ({
        id: transfer._id,
        epin: transfer.epinNo,
        fromMember: transfer.fromMember,
        toMember: transfer.toMember,
        transferDate: formatDate(transfer.createdAt),
        amount: Number(transfer.amount).toFixed(2),
        status: transfer.status,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.transferEpin = exports.transferEpins;

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
    const franchises = await EpinFranchise.find(filter).sort({ createdAt: -1 });
    const stockMap = await unusedStockMapForOwners(franchises.map((f) => f.franchiseId));

    const rows = franchises.map((doc, index) => {
      const liveStock = stockMap[String(doc.franchiseId || '').trim().toUpperCase()] ?? Number(doc.stock || 0);
      return {
        id: index + 1,
        _id: doc._id,
        franchiseId: doc.franchiseId,
        name: doc.franchiseName,
        upi: doc.upiId,
        whatsapp: doc.whatsappNo,
        city: doc.city,
        stock: liveStock,
        qrImage: doc.qrImage,
        status: doc.status
      };
    });

    res.json({ success: true, franchises: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createOrUpdateFranchise = async (req, res) => {
  try {
    const payload = req.body || {};
    const franchiseId = String(req.params.franchiseId || payload.franchiseId || payload.id || '').trim();
    if (!franchiseId) return res.status(400).json({ success: false, message: 'franchiseId is required' });
    const liveStock = await countUnusedEpinsForOwner(franchiseId);
    const franchise = await EpinFranchise.findOneAndUpdate(
      { franchiseId },
      {
        franchiseName: payload.franchiseName || payload.name || 'Franchise',
        upiId: payload.upiId || payload.upi || '-',
        whatsappNo: payload.whatsappNo || payload.whatsapp || '-',
        city: payload.city || '-',
        stock: liveStock,
        qrImage: payload.qrImage || '',
        status: payload.status || 'SHOWING',
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ success: true, franchise: { franchiseId: franchise.franchiseId, name: franchise.franchiseName, upi: franchise.upiId, whatsapp: franchise.whatsappNo, city: franchise.city, stock: franchise.stock, qrImage: franchise.qrImage, status: franchise.status } });
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

    await EpinFranchise.deleteOne({ franchiseId: req.params.franchiseId });

    res.json({
      success: true,
      message: 'Franchise deleted successfully',
      franchise: {
        franchiseId: franchise.franchiseId,
        name: franchise.franchiseName,
        upi: franchise.upiId,
        whatsapp: franchise.whatsappNo,
        city: franchise.city,
        stock: franchise.stock,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPackages = async (req, res) => {
  try {
    const packages = await EpinPackage.find({ isActive: true }).sort({ price: 1 });
    res.json({ success: true, packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPackage = async (req, res) => {
  try {
    const { packageName, price } = req.body;
    if (!packageName || price === undefined) {
      return res.status(400).json({ success: false, message: 'packageName and price are required' });
    }
    const pkg = await EpinPackage.create({ packageName: packageName.trim(), price: Number(price) });
    res.status(201).json({ success: true, package: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePackage = async (req, res) => {
  try {
    const { packageName, price, isActive } = req.body;
    const pkg = await EpinPackage.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

    if (packageName !== undefined) pkg.packageName = packageName.trim();
    if (price !== undefined) pkg.price = Number(price);
    if (isActive !== undefined) pkg.isActive = Boolean(isActive);

    await pkg.save();
    res.json({ success: true, package: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePackage = async (req, res) => {
  try {
    const pkg = await EpinPackage.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

    pkg.isActive = false;
    await pkg.save();
    res.json({ success: true, message: 'Package removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// Franchise Delivery & Stock
// ─────────────────────────────────────────────────────────────────────────────

exports.getFranchiseDeliveryReport = async (req, res) => {
  try {
    const memberId = req.user.memberId;

    // Check if the user is a franchise
    const franchise = await EpinFranchise.findOne({ franchiseId: memberId });
    if (!franchise) {
      return res.status(403).json({ success: false, message: 'You are not an E-Pin Franchise' });
    }

    // Find all users who registered using an e-pin distributed by this franchise.
    // When a franchise transfers an E-pin, they were the currentOwner, or if they generated it, they were the generator.
    // However, wait. If they transferred the E-Pin to the user BEFORE registration, the user isn't registered yet so they can't transfer it to the user's memberId in the system directly.
    // Usually, the franchise just gives the E-Pin code to the user, and the user enters it on the registration form.
    // In that case, the E-Pin's currentOwner at the time of registration is the franchise.
    // Let's find all E-pins where this franchise was the currentOwner or generatedBy.
    // Actually, to be very precise, find all USED E-pins where franchise is the one who distributed it.
    // The easiest way is to find all users whose `epin` matches an E-pin that this franchise generated or currently owned.
    const franchiseEpins = await Epin.find({
      status: 'Used',
      $or: [
        { generatedBy: memberId },
        { currentOwner: memberId }
      ]
    }).select('epinNo');

    const epinNos = franchiseEpins.map(e => e.epinNo);

    const users = await User.find({ epin: { $in: epinNos } }).sort({ createdAt: -1 });

    const report = users.map((u, i) => ({
      id: i + 1,
      userId: u._id,
      memberId: u.memberId,
      name: u.name,
      contactNo: u.contactNo,
      joiningPackage: u.joiningPackage || 'N/A',
      registeredAt: u.createdAt,
      deliveryStatus: u.joiningPackageDeliveryStatus || 'Pending',
      deliveredAt: u.joiningPackageDeliveredAt,
      deliveredBy: u.joiningPackageDeliveredBy
    }));

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyJoiningPackageDelivery = async (req, res) => {
  try {
    const memberId = req.user.memberId;
    const { userId, deliveryCode } = req.body;

    const franchise = await EpinFranchise.findOne({ franchiseId: memberId });
    if (!franchise) {
      return res.status(403).json({ success: false, message: 'You are not an E-Pin Franchise' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.joiningPackageDeliveryStatus === 'Delivered') {
      return res.status(400).json({ success: false, message: 'Package already delivered' });
    }

    if (user.joiningPackageDeliveryCode !== String(deliveryCode).trim()) {
      return res.status(400).json({ success: false, message: 'Invalid Delivery OTP' });
    }

    user.joiningPackageDeliveryStatus = 'Delivered';
    user.joiningPackageDeliveredAt = new Date();
    user.joiningPackageDeliveredBy = memberId;
    await user.save();

    res.json({ success: true, message: 'Package marked as delivered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFranchiseStock = async (req, res) => {
  try {
    const memberId = req.user.memberId;
    const franchise = await EpinFranchise.findOne({ franchiseId: memberId });
    if (!franchise) {
      return res.status(403).json({ success: false, message: 'You are not an E-Pin Franchise' });
    }

    const stockCount = await countUnusedEpinsForOwner(memberId);

    res.json({ success: true, stock: stockCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  ...module.exports,
  unusedStockMapForOwners,
  countUnusedEpinsForOwner,
};