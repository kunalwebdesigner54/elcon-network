const mongoose = require('mongoose');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const User = require('../models/User');
const productSeedData = require('../data/productSeedData');
const { distributeRepurchaseIncome } = require('../services/repurchaseIncomeService');
const { createWalletTransaction } = require('../utils/walletHelper');

const productToApiShape = (product) => ({
  id: product._id,
  _id: product._id,
  type: product.type,
  productCode: product.productCode,
  productName: product.productName,
  name: product.productName,
  category: product.category,
  hsnCode: product.hsnCode,
  mrp: product.mrp,
  dpPrice: product.dpPrice,
  price: product.dpPrice,
  discount: product.discount,
  gst: product.gst,
  shipping: product.shipping,
  bvPoint: product.bvPoint,
  bv: product.bvPoint,
  levelPoint: product.levelPoint,
  levelPlan: product.levelPoint,
  quantity: product.quantity,
  status: product.status,
  stock: product.quantity > 0 && product.status === 'SHOWING' ? 'In Stock' : 'Out of Stock',
  imageKey: product.imageKey || product.images?.[0] || '',
  images: product.images || [],
  description: product.description,
  specifications: product.specifications,
  features: product.features,
  size: product.size,
  color: product.color,
  weight: product.weight,
  dimension: product.dimension,
  reserveAmount: product.reserveAmount,
});

const getQueryType = (req) => String(req.query.type || '').trim().toLowerCase();

const buildOrderNo = async () => {
  let orderNo = '';
  let isUnique = false;

  while (!isUnique) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    orderNo = `ORD${suffix}`;
    const existing = await Order.findOne({ orderNo });
    if (!existing) {
      isUnique = true;
    }
  }

  return orderNo;
};

const buildShippingInformation = (user) => [
  { label: 'Name', value: user?.name || '---' },
  { label: 'Contact No', value: user?.contactNo || '---' },
  { label: 'Address', value: user?.address || '---' },
  { label: 'Area', value: user?.city || user?.district || '---' },
  { label: 'State,City', value: [user?.state, user?.city].filter(Boolean).join(' , ') || '---' },
  { label: 'Pin Code', value: user?.pincode || '---' },
];

const findProduct = async (identifier) => {
  if (!identifier) {
    return null;
  }

  const cleanId = String(identifier).trim();
  if (mongoose.Types.ObjectId.isValid(cleanId)) {
    const found = await Product.findById(cleanId);
    if (found) return found;
  }

  return Product.findOne({ productCode: cleanId });
};

const toNumber = (value, fallback = 0) => {
  const normalized = String(value ?? '').trim().toLowerCase();

  if (!normalized || normalized === 'free') {
    return fallback;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
};

exports.seedProducts = async () => {
  const existingCount = await Product.countDocuments();
  if (existingCount > 0) {
    return;
  }

  await Product.insertMany(productSeedData);
};

const productsCache = new Map();

exports.getProducts = async (req, res, isAdmin = false) => {
  try {
    const isAdminRequest = isAdmin === true;
    const type = getQueryType(req);
    const filter = isAdminRequest ? {} : { status: 'SHOWING' };
    if (type) filter.type = type;

    const cacheKey = JSON.stringify(filter);
    if (!isAdminRequest && productsCache.has(cacheKey)) {
      const cachedData = productsCache.get(cacheKey);
      return res.status(200).json({
        success: true,
        count: cachedData.length,
        products: cachedData.map(productToApiShape),
      });
    }

    const products = await Product.aggregate([
      { $match: filter },
      {
        $project: {
          type: 1, productCode: 1, productName: 1, category: 1, hsnCode: 1,
          mrp: 1, dpPrice: 1, discount: 1, gst: 1, shipping: 1, bvPoint: 1, levelPoint: 1,
          quantity: 1, reserveAmount: 1, status: 1, size: 1, color: 1, weight: 1, dimension: 1,
          imageKey: 1,
          images: 1,
        }
      }
    ]);

    if (!isAdminRequest) {
      productsCache.set(cacheKey, products);
      // clear cache after 1 minute
      setTimeout(() => productsCache.delete(cacheKey), 60 * 1000);
    }

    res.status(200).json({
      success: true,
      count: products.length,
      products: products.map(productToApiShape),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await findProduct(req.params.productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product: productToApiShape(product) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminProducts = async (req, res) => {
  return exports.getProducts(req, res, true);
};

exports.createProduct = async (req, res) => {
  try {
    const payload = req.body || {};

    if (!payload.productCode || !payload.productName || !payload.type) {
      return res.status(400).json({
        success: false,
        message: 'productCode, productName, and type are required',
      });
    }

    const exists = await Product.findOne({ productCode: payload.productCode });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Product code already exists',
      });
    }

    const product = await Product.create({
      type: payload.type,
      productCode: payload.productCode,
      productName: payload.productName,
      category: payload.category || 'General',
      hsnCode: payload.hsnCode || '0000',
      mrp: toNumber(payload.mrp),
      dpPrice: toNumber(payload.dpPrice),
      discount: toNumber(payload.discount),
      gst: toNumber(payload.gst),
      shipping: toNumber(payload.shipping),
      bvPoint: toNumber(payload.bvPoint),
      levelPoint: toNumber(payload.levelPoint),
      quantity: toNumber(payload.quantity),
      status: payload.status || 'SHOWING',
      imageKey: payload.imageKey || payload.images?.[0] || '',
      images: Array.isArray(payload.images) ? payload.images : [],
      description: payload.description || '',
      specifications: payload.specifications || '',
      features: payload.features || '',
      size: payload.size || '',
      color: payload.color || '',
      weight: payload.weight || '',
      dimension: payload.dimension || '',
      reserveAmount: toNumber(payload.reserveAmount),
    });

    productsCache.clear();
    res.status(201).json({ success: true, product: productToApiShape(product) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await findProduct(req.params.productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updates = req.body || {};
    const fields = [
      'type',
      'productCode',
      'productName',
      'category',
      'hsnCode',
      'mrp',
      'dpPrice',
      'discount',
      'gst',
      'shipping',
      'bvPoint',
      'levelPoint',
      'quantity',
      'status',
      'imageKey',
      'images',
      'description',
      'specifications',
      'features',
      'size',
      'color',
      'weight',
      'dimension',
      'reserveAmount',
    ];

    fields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        product[field] = updates[field];
      }
    });

    if (updates.mrp !== undefined) product.mrp = toNumber(updates.mrp);
    if (updates.dpPrice !== undefined) product.dpPrice = toNumber(updates.dpPrice);
    if (updates.discount !== undefined) product.discount = toNumber(updates.discount);
    if (updates.gst !== undefined) product.gst = toNumber(updates.gst);
    if (updates.shipping !== undefined) product.shipping = toNumber(updates.shipping);
    if (updates.bvPoint !== undefined) product.bvPoint = toNumber(updates.bvPoint);
    if (updates.levelPoint !== undefined) product.levelPoint = toNumber(updates.levelPoint);
    if (updates.quantity !== undefined) product.quantity = toNumber(updates.quantity);
    if (updates.reserveAmount !== undefined) product.reserveAmount = toNumber(updates.reserveAmount);

    await product.save();
    productsCache.clear();

    res.status(200).json({ success: true, product: productToApiShape(product) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await findProduct(req.params.productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();
    productsCache.clear();

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    const legacyCouponBalance = Number(user?.discountCouponBalance || 0);
    const couponWalletBalance = Number(user?.couponWalletBalance || 0) + legacyCouponBalance;

    console.log(`[CART COUPON DEBUG] userId=${req.user.id}, memberId=${user?.memberId}, couponWalletBalance=${user?.couponWalletBalance}, discountCouponBalance=${user?.discountCouponBalance}, combined=${couponWalletBalance}`);

    if (user && legacyCouponBalance > 0) {
      user.couponWalletBalance = couponWalletBalance;
      user.discountCouponBalance = 0;
      await user.save();
    }

    res.status(200).json({
      success: true,
      cart: cart || { items: [], userId: req.user.id },
      couponWalletBalance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addCartItem = async (req, res) => {
  try {
    const product = await findProduct(req.body.productId || req.body.productCode);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const quantity = Math.max(1, Number(req.body.quantity || 1));
    const cart = (await Cart.findOne({ userId: req.user.id })) ||
      new Cart({ userId: req.user.id, items: [] });

    const selectedSize = String(req.body.selectedSize || '').trim();
    const selectedColor = String(req.body.selectedColor || '').trim();
    const existingItem = cart.items.find(
      (item) => String(item.productId) === String(product._id)
        && item.selectedSize === selectedSize
        && item.selectedColor === selectedColor
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.totalPrice = existingItem.quantity * existingItem.price;
    } else {
      cart.items.push({
        productId: product._id,
        productCode: product.productCode,
        productName: product.productName,
        category: product.category,
        imageKey: product.imageKey,
        price: product.dpPrice,
        quantity,
        totalPrice: quantity * product.dpPrice,
        bvPoint: product.bvPoint,
        discount: product.discount || 0,
        reserveAmount: product.reserveAmount,
        selectedSize,
        selectedColor,
      });
    }

    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find((entry) => String(entry.productId) === String(req.params.productId));
    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    item.quantity = Math.max(1, Number(req.body.quantity || item.quantity));
    item.totalPrice = item.quantity * item.price;

    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((entry) => String(entry.productId) !== String(req.params.productId));
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(200).json({ success: true, cart: { items: [] } });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkoutCart = async (req, res) => {
  let walletDebitAmount = 0;
  let walletDebitApplied = false;

  try {
    const user = await User.findById(req.user.id).select('+transactionPassword');
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart || !cart.items.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const paymentMode = String(req.body.paymentMode || '').trim();
    const transactionPassword = String(req.body.transactionPassword || '').trim();
    const confirmTransactionPassword = String(req.body.confirmTransactionPassword || '').trim();

    const allowedPaymentModes = ['E-Wallet', 'R-Wallet', 'UPI ID', 'BANK TRANSFER'];

    if (!paymentMode || !allowedPaymentModes.includes(paymentMode)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid payment mode',
      });
    }

    if (!transactionPassword || !confirmTransactionPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both transaction passwords',
      });
    }

    if (transactionPassword !== confirmTransactionPassword) {
      return res.status(400).json({
        success: false,
        message: 'Transaction passwords do not match',
      });
    }

    if (!user?.transactionPassword) {
      return res.status(400).json({
        success: false,
        message: 'Transaction password is not set for this account',
      });
    }

    const isTransactionPasswordValid = await user.matchTransactionPassword(transactionPassword);

    if (!isTransactionPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Transaction password is incorrect',
      });
    }

    const orderNo = await buildOrderNo();
    const orderDate = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    let bvPoint = 0;
    let lvPoint = 0;
    let totalReserveAmount = 0;
    let calculatedDiscount = 0;

    const availableCouponBalance =
      Number(user.couponWalletBalance || 0) + Number(user.discountCouponBalance || 0);
    let remainingCoupon = availableCouponBalance;
    const finalOrderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      const qty = Number(item.quantity || 1);

      let itemCouponUsed = 0;

      if (product) {
        bvPoint += Number(product.bvPoint || 0) * qty;
        lvPoint += Number(product.levelPoint || 0) * qty;
        totalReserveAmount += Number(product.reserveAmount || 0) * qty;

        const itemMaxDiscount = Number(product.discount || 0) * qty;
        calculatedDiscount += itemMaxDiscount;

        const appliedToThisItem = Math.min(itemMaxDiscount, remainingCoupon);
        itemCouponUsed = appliedToThisItem;
        remainingCoupon -= appliedToThisItem;
      }

      finalOrderItems.push({
        productId: item.productId,
        productCode: item.productCode,
        name: item.productName,
        price: item.price,
        quantity: qty,
        totalPrice: item.totalPrice,
        imageKey: item.imageKey,
        couponUsed: itemCouponUsed,
        selectedSize: item.selectedSize || '',
        selectedColor: item.selectedColor || '',
      });
    }

    let appliedDiscount = availableCouponBalance - remainingCoupon;

    const totalPrice = cart.items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
    const shippingCharge = Number(req.body.shippingCharge || 0);
    const finalTotal = totalPrice + shippingCharge - appliedDiscount;

    if (finalTotal < 0) {
      return res.status(400).json({ success: false, message: 'Order total cannot be negative' });
    }

    walletDebitAmount = paymentMode === 'E-Wallet' ? finalTotal : 0;
    let updatedUser = user;
    if (walletDebitAmount > 0 || appliedDiscount > 0) {
      const balanceFilter = walletDebitAmount > 0
        ? { _id: user._id, walletBalance: { $gte: walletDebitAmount } }
        : { _id: user._id };
      const balanceUpdate = {
        ...(walletDebitAmount > 0 ? { $inc: { walletBalance: -walletDebitAmount } } : {}),
        ...(appliedDiscount > 0 ? { $set: { couponWalletBalance: remainingCoupon, discountCouponBalance: 0 } } : {}),
      };
      updatedUser = await User.findOneAndUpdate(balanceFilter, balanceUpdate, { new: true });
      if (walletDebitAmount > 0) {
        await createWalletTransaction({
          memberId: user.memberId,
          description: `PRODUCT PURCHASE - ${orderNo}`,
          debit: walletDebitAmount,
        });
      }
    }

    if (!updatedUser) {
      return res.status(400).json({ success: false, message: 'Insufficient E-Wallet balance' });
    }

    walletDebitApplied = walletDebitAmount > 0;
    user.walletBalance = updatedUser.walletBalance;
    if (appliedDiscount > 0) {
      user.couponWalletBalance = updatedUser.couponWalletBalance;
      user.discountCouponBalance = updatedUser.discountCouponBalance;
    }

    const order = await Order.create({
      userId: req.user.id,
      orderNo,
      orderDate,
      paymentMode,
      paymentStatus: 'Paid',
      orderStatus: 'Pending',
      orderItems: cart.items.length,
      totalPrice,
      lvPoint,
      bvPoint,
      startDate: orderDate,
      endDate: orderDate,
      shippingCharge,
      discountCoupon: appliedDiscount,
      finalTotal,
      reserveAmount: totalReserveAmount,
      shippingInformation: buildShippingInformation(user),
      items: finalOrderItems,
    });

    cart.items = [];
    await cart.save();

    // Repurchase Income Distribution is now handled in updateOrderStatus when marked as Delivered.

    res.status(201).json({ success: true, order });
  } catch (error) {
    if (walletDebitApplied && walletDebitAmount > 0) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { walletBalance: walletDebitAmount } });
      await createWalletTransaction({
        memberId: user.memberId,
        description: `PRODUCT PURCHASE REFUND - ${orderNo}`,
        credit: walletDebitAmount,
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders: orders.map((order) => ({
        id: order._id,
        orderNo: order.orderNo,
        orderDate: order.orderDate,
        memberId: req.user.memberId || req.user.epin || String(req.user.id),
        items: `${order.orderItems} ITEMS`,
        totalPaid: order.finalTotal,
        payMode: order.paymentMode,
        payStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        lvPoint: Number(order.lvPoint || 0),
        bvPoint: Number(order.bvPoint || 0),
        startDate: order.startDate || order.orderDate,
        endDate: order.endDate || order.orderDate,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderByNo = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNo: req.params.orderNo });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const ownerIds = [String(order.userId)].filter(Boolean);
    const users = await User.find({ _id: { $in: ownerIds } }).select('_id memberId name contactNo').lean();
    const userMap = new Map(users.map((user) => [String(user._id), user]));
    const owner = userMap.get(String(order.userId)) || {};

    const orderOwnerId = owner._id || order.userId;
    if (String(orderOwnerId) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({
      success: true,
      order: {
        orderNo: order.orderNo,
        orderDate: order.orderDate,
        memberId: owner.memberId || String(order.userId || ''),
        paymentMode: order.paymentMode,
        orderItems: order.orderItems,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        totalPrice: order.totalPrice,
        lvPoint: Number(order.lvPoint || 0),
        bvPoint: Number(order.bvPoint || 0),
        startDate: order.startDate || order.orderDate,
        endDate: order.endDate || order.orderDate,
        shippingCharge: order.shippingCharge,
        discountCoupon: order.discountCoupon,
        finalTotal: order.finalTotal,
        shippingInformation: order.shippingInformation,
        items: (order.items || []).map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          imageKey: item.imageKey,
          selectedSize: item.selectedSize || '',
          selectedColor: item.selectedColor || '',
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const userIds = [...new Set(orders.map((order) => String(order.userId || '')).filter(Boolean))];
    const users = await User.find({ _id: { $in: userIds } }).select('_id memberId name contactNo').lean();
    const userMap = new Map(users.map((user) => [String(user._id), user]));

    res.status(200).json({
      success: true,
      orders: orders.map((order, index) => {
        const owner = userMap.get(String(order.userId)) || {};
        return {
          sNo: index + 1,
          id: order._id,
          orderNo: order.orderNo,
          memberId: owner.memberId || String(order.userId || ''),
          orderDate: order.orderDate,
          items: `${order.orderItems} ITEMS`,
          totalPaid: order.finalTotal,
          payMode: order.paymentMode,
          payStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          lvPoint: Number(order.lvPoint || 0),
          bvPoint: Number(order.bvPoint || 0),
          startDate: order.startDate || order.orderDate,
          endDate: order.endDate || order.orderDate,
        };
      }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNo: req.params.orderNo });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousStatus = order.orderStatus;

    if (req.body.orderStatus) {
      order.orderStatus = req.body.orderStatus;
    }

    if (req.body.paymentStatus) {
      order.paymentStatus = req.body.paymentStatus;
    }

    await order.save();

    // Trigger Repurchase Income distribution when marked as Delivered
    if (previousStatus !== 'Delivered' && order.orderStatus === 'Delivered' && order.bvPoint > 0) {
      const purchaserUser = await User.findById(order.userId);
      if (purchaserUser) {
        // Fire and forget so we don't block the API response
        distributeRepurchaseIncome(order, purchaserUser, order.bvPoint).catch(err => {
          console.error(`Failed to distribute repurchase income for order ${order.orderNo}:`, err);
        });
      }
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




exports.getAdminGstReport = async (req, res) => {
  try {
    const report = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          customerName: {
            $reduce: {
              input: '$shippingInformation',
              initialValue: '$user.name',
              in: {
                $cond: [{ $eq: ['$$this.label', 'Name'] }, '$$this.value', '$$value']
              }
            }
          },
          customerMobile: {
            $reduce: {
              input: '$shippingInformation',
              initialValue: '$user.contactNo',
              in: {
                $cond: [{ $eq: ['$$this.label', 'Contact No'] }, '$$this.value', '$$value']
              }
            }
          },
          customerStateRaw: {
            $reduce: {
              input: '$shippingInformation',
              initialValue: '',
              in: {
                $cond: [{ $eq: ['$$this.label', 'State,City'] }, '$$this.value', '$$value']
              }
            }
          },
          gstRate: { $ifNull: ['$productDetails.gst', 18] } // fallback to 18% if missing
        }
      },
      {
        $addFields: {
          customerState: {
            $arrayElemAt: [{ $split: ['$customerStateRaw', ' , '] }, 0]
          },
          taxableValue: {
            $divide: ['$items.totalPrice', { $add: [1, { $divide: ['$gstRate', 100] }] }]
          }
        }
      },
      {
        $addFields: {
          totalGstAmount: { $subtract: ['$items.totalPrice', '$taxableValue'] }
        }
      },
      {
        $project: {
          memberId: '$user.memberId',
          memberName: '$user.name',
          customerName: 1,
          customerMobile: 1,
          orderNo: 1,
          invoiceNo: '$orderNo',
          orderDate: 1,
          productName: '$items.name',
          hsnCode: { $ifNull: ['$productDetails.hsnCode', ''] },
          quantity: '$items.quantity',
          unitPrice: '$items.price',
          taxableValue: { $round: ['$taxableValue', 2] },
          gstRate: 1,
          cgst: { $round: [{ $divide: ['$totalGstAmount', 2] }, 2] },
          sgst: { $round: [{ $divide: ['$totalGstAmount', 2] }, 2] },
          igst: { $literal: 0.00 },
          totalAmount: '$items.totalPrice',
          paymentMode: 1,
          customerState: 1,
          orderStatus: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminGstSummary = async (req, res) => {
  try {
    const summary = await Order.aggregate([
      {
        $addFields: {
          monthYear: {
            $dateToString: { format: '%m-%Y', date: '$createdAt' }
          }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          gstRate: { $ifNull: ['$productDetails.gst', 18] }
        }
      },
      {
        $addFields: {
          taxableValue: {
            $divide: ['$items.totalPrice', { $add: [1, { $divide: ['$gstRate', 100] }] }]
          }
        }
      },
      {
        $addFields: {
          totalGstAmount: { $subtract: ['$items.totalPrice', '$taxableValue'] }
        }
      },
      {
        $group: {
          _id: '$monthYear',
          totalOrders: { $addToSet: '$orderNo' },
          totalQuantitySold: { $sum: '$items.quantity' },
          taxableSales: { $sum: '$taxableValue' },
          totalGst: { $sum: '$totalGstAmount' },
          grossSales: { $sum: '$items.totalPrice' }
        }
      },
      {
        $project: {
          month: '$_id',
          totalOrders: { $size: '$totalOrders' },
          totalQuantitySold: 1,
          taxableSales: { $round: ['$taxableSales', 2] },
          cgst: { $round: [{ $divide: ['$totalGst', 2] }, 2] },
          sgst: { $round: [{ $divide: ['$totalGst', 2] }, 2] },
          igst: { $literal: 0.00 },
          totalGst: { $round: ['$totalGst', 2] },
          grossSales: { $round: ['$grossSales', 2] }
        }
      },
      { $sort: { month: -1 } }
    ]);

    res.status(200).json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/coupon-transaction-history
// ─────────────────────────────────────────────────────────────────────────────
exports.getCouponTransactionHistory = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id, discountCoupon: { $gt: 0 } }).sort({ createdAt: -1 });

    const finalHistory = [];
    orders.forEach(order => {
      const totalItemsCoupon = order.items.reduce((sum, i) => sum + (i.couponUsed || 0), 0);
      if (totalItemsCoupon === 0 && order.discountCoupon > 0) {
        finalHistory.push({
          orderNo: order.orderNo,
          orderDate: order.orderDate,
          productName: order.items.map(i => i.name).join(', '),
          quantity: order.items.reduce((s, i) => s + i.quantity, 0),
          couponUsed: order.discountCoupon,
          isLegacy: true
        });
      } else {
        order.items.forEach(item => {
          if (item.couponUsed > 0) {
            finalHistory.push({
              orderNo: order.orderNo,
              orderDate: order.orderDate,
              productName: item.name,
              quantity: item.quantity,
              couponUsed: item.couponUsed,
              isLegacy: false
            });
          }
        });
      }
    });

    res.status(200).json({ success: true, history: finalHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
