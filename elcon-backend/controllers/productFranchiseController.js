const User = require('../models/User');
const EpinFranchise = require('../models/EpinFranchise');
const Product = require('../models/Product');
const ProductFranchiseStock = require('../models/ProductFranchiseStock');
const Order = require('../models/Order');

// ─────────────────────────────────────────────────────────────────────────────
// Admin APIs
// ─────────────────────────────────────────────────────────────────────────────

// @desc Admin assigns stock to a franchise
exports.assignStock = async (req, res) => {
  try {
    const { franchiseId, productId, quantity } = req.body;

    if (!franchiseId || !productId || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid stock assignment parameters' });
    }

    const franchise = await EpinFranchise.findOne({ franchiseId });
    if (!franchise) return res.status(404).json({ success: false, message: 'Franchise not found' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Upsert the stock
    let stock = await ProductFranchiseStock.findOne({ franchiseId, productId });
    if (stock) {
      stock.quantity += Number(quantity);
      await stock.save();
    } else {
      stock = await ProductFranchiseStock.create({
        franchiseId,
        productId,
        quantity: Number(quantity)
      });
    }

    res.json({ success: true, message: 'Stock assigned successfully', stock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Admin view all franchise product stocks
exports.getAllStocks = async (req, res) => {
  try {
    const stocks = await ProductFranchiseStock.find().populate('productId', 'productName type image').lean();
    
    // Format the response
    const formattedStocks = await Promise.all(stocks.map(async (s) => {
      const franchise = await EpinFranchise.findOne({ franchiseId: s.franchiseId });
      return {
        _id: s._id,
        franchiseId: s.franchiseId,
        franchiseName: franchise ? franchise.franchiseName : 'Unknown',
        productId: s.productId ? s.productId._id : null,
        productName: s.productId ? s.productId.productName : 'Deleted Product',
        type: s.productId ? s.productId.type : 'N/A',
        quantity: s.quantity,
        updatedAt: s.updatedAt
      };
    }));

    res.json({ success: true, stocks: formattedStocks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Franchise APIs
// ─────────────────────────────────────────────────────────────────────────────

// @desc Franchise gets their own stock
exports.getMyStock = async (req, res) => {
  try {
    const memberId = req.user.memberId;
    const stocks = await ProductFranchiseStock.find({ franchiseId: memberId })
                                              .populate('productId', 'productName productCode price dpPrice type image')
                                              .lean();
    
    const formattedStocks = stocks.map(s => ({
      _id: s._id,
      productId: s.productId ? s.productId._id : null,
      productCode: s.productId ? s.productId.productCode : 'N/A',
      productName: s.productId ? s.productId.productName : 'Deleted Product',
      type: s.productId ? s.productId.type : 'N/A',
      price: s.productId ? s.productId.price : 0,
      dpPrice: s.productId ? s.productId.dpPrice : 0,
      quantity: s.quantity,
      image: s.productId ? s.productId.image : null
    }));

    res.json({ success: true, stocks: formattedStocks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Franchise sells product (Shortcut transaction)
exports.sellProduct = async (req, res) => {
  try {
    const memberId = req.user.memberId;
    const { userId, items } = req.body; // items: [{ productId, quantity }]

    if (!userId || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'User ID and items are required' });
    }

    const buyer = await User.findOne({ memberId: userId });
    if (!buyer) return res.status(404).json({ success: false, message: 'Buyer user not found' });

    // Validate stock and prepare order items
    const orderItems = [];
    let totalPrice = 0;
    let totalBv = 0;
    let totalLv = 0;

    for (const item of items) {
      const stockRec = await ProductFranchiseStock.findOne({ franchiseId: memberId, productId: item.productId });
      if (!stockRec || stockRec.quantity < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for product ID: ${item.productId}` });
      }

      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });

      const price = product.dpPrice || product.price;
      const itemTotal = price * item.quantity;
      totalPrice += itemTotal;
      totalBv += (product.bvPoint || 0) * item.quantity;
      totalLv += (product.lvPoint || 0) * item.quantity;

      orderItems.push({
        productId: product._id,
        productCode: product.productCode || 'N/A',
        name: product.productName,
        price: price,
        quantity: item.quantity,
        totalPrice: itemTotal,
        imageKey: product.image || '',
        couponUsed: 0
      });
    }

    // Deduct Stock
    for (const item of items) {
       await ProductFranchiseStock.updateOne(
         { franchiseId: memberId, productId: item.productId },
         { $inc: { quantity: -item.quantity } }
       );
    }

    // Generate Order No
    const orderCount = await Order.countDocuments();
    const orderNo = `ELCON-${1000 + orderCount + 1}`;
    
    const now = new Date();
    const orderDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    // Create Order
    const order = await Order.create({
      userId: buyer._id,
      orderNo,
      orderDate,
      paymentMode: 'Franchise Direct',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered', // Directly delivered
      franchiseId: memberId,
      orderItems: items.length,
      totalPrice: totalPrice,
      finalTotal: totalPrice,
      lvPoint: totalLv,
      bvPoint: totalBv,
      items: orderItems,
      shippingInformation: [
        { label: 'Delivery Note', value: `Delivered by Franchise: ${memberId}` }
      ]
    });

    // Handle Commissions using standard engine
    try {
      const { distributeRepurchaseIncome } = require('../services/repurchaseIncomeService');
      distributeRepurchaseIncome(order, buyer, order.bvPoint).catch(err => {
        console.error(`Failed to distribute repurchase income for franchise sale order ${order.orderNo}:`, err);
      });
    } catch (e) {
      console.error('Error processing commissions for franchise sale:', e);
      // We don't fail the transaction, but we log the error
    }

    res.json({ success: true, message: 'Products sold successfully', orderNo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Franchise view their sales/delivery report
exports.getSales = async (req, res) => {
  try {
    const memberId = req.user.memberId;
    const orders = await Order.find({ franchiseId: memberId })
                              .populate('userId', 'memberId name contactNo')
                              .sort({ createdAt: -1 })
                              .lean();
    
    const report = orders.map((o, i) => ({
      id: i + 1,
      orderNo: o.orderNo,
      orderDate: o.orderDate,
      buyerId: o.userId ? o.userId.memberId : 'N/A',
      buyerName: o.userId ? o.userId.name : 'N/A',
      buyerContact: o.userId ? o.userId.contactNo : 'N/A',
      items: o.items.map(item => `${item.name} (x${item.quantity})`).join(', '),
      totalPrice: o.finalTotal,
      status: o.orderStatus
    }));

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
