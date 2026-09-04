// p2pbackend/controllers/authController.js

const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Epin = require('../models/Epin');
const SiteSetting = require('../models/SiteSetting');
const Product = require('../models/Product');
const EpinPackage = require('../models/EpinPackage');
const crypto = require('crypto');

const sendPasswordResetEmail = async (email, token) => {
  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (err) {
    console.warn('nodemailer is not installed. Skipping email send.');
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reset-password/${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Admin password reset request',
    text: `Use this link to reset your admin password (valid for 15 minutes): ${resetUrl}`,
  });
};

/**
 * Generate JWT Token
 * @param {string} id - User ID
 * @param {string} role - User role
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: String(user._id),
      memberId: user.memberId,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};

/**
 * Register a new user
 * POST /api/auth/register
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.registerUser = async (req, res) => {
  try {
    const globalSettingsDoc = await SiteSetting.findOne({ settingKey: 'global-settings' });
    if (globalSettingsDoc && globalSettingsDoc.data && globalSettingsDoc.data.registrationEnabled === false) {
      return res.status(403).json({
        success: false,
        message: 'Registration is currently temporarily disabled by the administrator.',
        code: 'REGISTRATION_DISABLED'
      });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const {
      sponsorId,
      sponsorName,
      name,
      contactNo,
      dateOfBirth,
      email,
      aadharNo,
      address,
      country,
      state,
      district,
      city,
      pincode,
      joiningPackage,
      epin,
      password,
      acceptedTerms,
      panNo,
    } = req.body;

    // ========== STRICT DUPLICATE VALIDATION - "ONE PERSON, ONE ID POLICY" ==========

    // 1. Check if email already exists
    if (email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered',
          code: 'EMAIL_DUPLICATE',
        });
      }
    }

    // 2. Check if mobile number already exists
    if (contactNo) {
      const mobileExists = await User.findOne({ contactNo });
      if (mobileExists) {
        return res.status(409).json({
          success: false,
          message: 'Mobile number already registered',
          code: 'MOBILE_DUPLICATE',
        });
      }
    }

    // 3. Check if Aadhaar number already exists
    if (aadharNo) {
      const aadharExists = await User.findOne({ aadharNo });
      if (aadharExists) {
        return res.status(409).json({
          success: false,
          message: 'Aadhaar number already used',
          code: 'AADHAAR_DUPLICATE',
        });
      }
    }

    // 4. Check if PAN card number already exists
    if (panNo) {
      const panExists = await User.findOne({ panNo });
      if (panExists) {
        return res.status(409).json({
          success: false,
          message: 'PAN card already exists',
          code: 'PAN_DUPLICATE',
        });
      }
    }

    // ========== ALL VALIDATION PASSED - CREATE USER ==========

    // ========== 3-WAY VALIDATION: PACKAGE, EPIN & AMOUNTS MUST MATCH ==========
    if (!joiningPackage || String(joiningPackage).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please select a Joining Package.',
        code: 'JOINING_PACKAGE_REQUIRED',
      });
    }

    if (!epin || String(epin).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please enter an E-Pin for the selected Joining Package.',
        code: 'EPIN_REQUIRED',
      });
    }

    const foundEpin = await Epin.findOne({ epinNo: String(epin).trim() });
    if (!foundEpin) {
      return res.status(404).json({
        success: false,
        message: 'E-Pin not found. Please provide a valid E-Pin.',
        code: 'EPIN_NOT_FOUND',
      });
    }

    if (foundEpin.status !== 'Unused') {
      return res.status(400).json({
        success: false,
        message: `E-Pin is already ${foundEpin.status.toLowerCase()}. Only unused E-Pins can be used for registration.`,
        code: 'EPIN_INVALID',
      });
    }

    const epinCost = Number(foundEpin.cost || 0);
    let expectedPackageAmount = 350;

    // Check Product collection (joining products)
    const productDoc = await Product.findOne({
      type: 'joining',
      productName: new RegExp(`^${joiningPackage.trim()}$`, 'i'),
    }).lean();

    if (productDoc) {
      expectedPackageAmount = Number(productDoc.mrp || productDoc.dpPrice || 350);
      const isPriceMatch = epinCost === Number(productDoc.mrp) || epinCost === Number(productDoc.dpPrice);
      if (!isPriceMatch) {
        return res.status(400).json({
          success: false,
          message: `E-Pin amount (₹${epinCost}) does not match selected Package amount (₹${expectedPackageAmount}). Package and E-Pin amount must match to complete registration.`,
          code: 'EPIN_AMOUNT_MISMATCH',
          packageAmount: expectedPackageAmount,
          epinCost,
        });
      }
    } else {
      // Check EpinPackage collection
      const epinPkgDoc = await EpinPackage.findOne({
        packageName: new RegExp(`^${joiningPackage.trim()}$`, 'i'),
      }).lean();

      if (epinPkgDoc) {
        expectedPackageAmount = Number(epinPkgDoc.price || 0);
      }

      if (epinCost !== expectedPackageAmount) {
        return res.status(400).json({
          success: false,
          message: `E-Pin amount (₹${epinCost}) does not match selected Package amount (₹${expectedPackageAmount}). Package and E-Pin amount must match to complete registration.`,
          code: 'EPIN_AMOUNT_MISMATCH',
          packageAmount: expectedPackageAmount,
          epinCost,
        });
      }
    }

    let joiningAmount = epinCost;

    // Calculate physical level depth
    let levelDepth = 1;
    if (sponsorId) {
      const sponsor = await User.findOne({ memberId: sponsorId });
      if (sponsor && sponsor.levelDepth !== undefined && sponsor.levelDepth >= 0) {
        levelDepth = sponsor.levelDepth + 1;
      }
    }

    // Create new user with role='user'
    const user = await User.create({
      sponsorId,
      sponsorName,
      name,
      contactNo,
      dateOfBirth,
      email,
      levelDepth,
      aadharNo,
      address,
      country,
      state,
      district,
      city,
      pincode,
      joiningPackage,
      joiningAmount,
      epin,
      password,
      panNo,
      acceptedTerms: acceptedTerms === true || acceptedTerms === 'true',
      role: 'user',
      joiningPackageDeliveryCode: Math.floor(1000 + Math.random() * 9000).toString(),
    });

    if (foundEpin) {
      foundEpin.status = 'Used';
      foundEpin.usedBy = user.memberId;
      foundEpin.usedDate = new Date().toLocaleString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
      });
      await foundEpin.save();
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        memberId: user.memberId,
        sponsorId: user.sponsorId,
        sponsorName: user.sponsorName,
        name: user.name,
        contactNo: user.contactNo,
        dateOfBirth: user.dateOfBirth,
        email: user.email,
        aadharNo: user.aadharNo,
        address: user.address,
        country: user.country,
        state: user.state,
        district: user.district,
        city: user.city,
        pincode: user.pincode,
        joiningPackage: user.joiningPackage,
        epin: user.epin,
        panNo: user.panNo,
        acceptedTerms: user.acceptedTerms,
        role: user.role,
      },
    });

    // Distribute level income asynchronously (catch errors so they don't break the response)
    const { distributeLevelIncome } = require('../services/levelIncomeService');
    distributeLevelIncome(user.memberId, user.name, user.sponsorId).catch(err => {
      console.error('Failed to distribute level income:', err);
    });
  } catch (error) {
    // Handle unique constraint violations
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const fieldMessages = {
        email: 'Email already registered',
        contactNo: 'Mobile number already registered',
        aadharNo: 'Aadhaar number already used',
        panNo: 'PAN card already exists',
      };

      return res.status(409).json({
        success: false,
        message: fieldMessages[field] || `${field} already exists`,
        code: `${field.toUpperCase()}_DUPLICATE`,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.loginUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { memberId, email, password } = req.body;

    const query = {};

    if (memberId) {
      query.memberId = String(memberId).trim().toUpperCase();
    } else if (email) {
      query.email = String(email).trim().toLowerCase();
    }

    const user = await User.findOne(query).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked by the administrator.',
      });
    }

    // Check if password matches
    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        memberId: user.memberId,
        sponsorId: user.sponsorId,
        sponsorName: user.sponsorName,
        name: user.name,
        contactNo: user.contactNo,
        dateOfBirth: user.dateOfBirth,
        email: user.email,
        aadharNo: user.aadharNo,
        address: user.address,
        country: user.country,
        state: user.state,
        district: user.district,
        city: user.city,
        pincode: user.pincode,
        joiningPackage: user.joiningPackage,
        epin: user.epin,
        acceptedTerms: user.acceptedTerms,
        role: user.role,
        adminType: user.adminType,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

exports.requestAdminPasswordReset = async (req, res) => {
  const genericResponse = {
    success: true,
    message: 'If an admin account exists for this email, a reset link has been sent.',
  };
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    const admin = await User.findOne({ email, role: 'admin' }).select('+passwordResetTokenHash +passwordResetExpiresAt');
    if (!admin) return res.json(genericResponse);

    const token = crypto.randomBytes(32).toString('hex');
    admin.passwordResetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    admin.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await admin.save({ validateBeforeSave: false });
    try {
      await sendPasswordResetEmail(email, token);
    } catch (error) {
      admin.passwordResetTokenHash = undefined;
      admin.passwordResetExpiresAt = undefined;
      await admin.save({ validateBeforeSave: false });
      throw error;
    }
    return res.json(genericResponse);
  } catch (error) {
    console.error('requestAdminPasswordReset error:', error);
    return res.status(500).json({ success: false, message: 'Unable to send reset email' });
  }
};

exports.resetAdminPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (!token || !newPassword || newPassword !== confirmPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Valid token and matching password of at least 6 characters are required' });
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const admin = await User.findOne({
      role: 'admin',
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select('+passwordResetTokenHash +passwordResetExpiresAt');
    if (!admin) return res.status(400).json({ success: false, message: 'Reset link is invalid or expired' });
    admin.password = newPassword;
    admin.passwordResetTokenHash = undefined;
    admin.passwordResetExpiresAt = undefined;
    await admin.save();
    return res.json({ success: true, message: 'Admin password reset successfully' });
  } catch (error) {
    console.error('resetAdminPassword error:', error);
    return res.status(500).json({ success: false, message: 'Unable to reset password' });
  }
};

/**
 * Login as an existing user using admin impersonation
 * POST /api/auth/admin-login-user
 */
exports.loginAsUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { memberId } = req.body;
    const user = await User.findOne({ memberId: String(memberId).toUpperCase(), role: 'user', email: { $ne: 'admin@gmail.com' } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Admin logged in as user successfully',
      token,
      user: {
        id: user._id,
        memberId: user.memberId,
        sponsorId: user.sponsorId,
        sponsorName: user.sponsorName,
        name: user.name,
        contactNo: user.contactNo,
        dateOfBirth: user.dateOfBirth,
        email: user.email,
        aadharNo: user.aadharNo,
        address: user.address,
        country: user.country,
        state: user.state,
        district: user.district,
        city: user.city,
        pincode: user.pincode,
        joiningPackage: user.joiningPackage,
        epin: user.epin,
        acceptedTerms: user.acceptedTerms,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during admin impersonation login',
      error: error.message,
    });
  }
};

/**
 * Get current logged-in user profile
 * GET /api/auth/me
 * Protected route
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message,
    });
  }
};

/**
 * Get sponsor details by member ID or sponsor ID
 * GET /api/auth/sponsor/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSponsorDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid sponsor ID or member ID',
      });
    }

    // Search by memberId first, then by sponsorId
    const sponsor = await User.findOne({
      $or: [
        { memberId: id.toUpperCase() },
        { sponsorId: id.toUpperCase() }
      ]
    }).select('memberId sponsorId name email contactNo city paymentDetails');

    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: 'Sponsor not found',
      });
    }

    const stockCount = await Epin.countDocuments({ currentOwner: sponsor.memberId, status: 'Unused' });

    res.status(200).json({
      success: true,
      data: {
        memberId: sponsor.memberId,
        name: sponsor.name,
        email: sponsor.email,
        contactNo: sponsor.contactNo,
        sponsorId: sponsor.sponsorId,
        city: sponsor.city || '',
        upiId: sponsor.paymentDetails?.upiId || '',
        stock: stockCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sponsor details',
      error: error.message,
    });
  }
};

/**
 * GET /api/auth/joining-packages
 * Fetch all available joining packages with prices for registration
 */
exports.getJoiningPackages = async (req, res) => {
  try {
    const list = [];
    const seen = new Set();

    // 1. EpinPackage
    const epinPackages = await EpinPackage.find({ isActive: true }).sort({ price: 1 }).lean();
    epinPackages.forEach((pkg) => {
      const name = pkg.packageName.trim();
      const price = Number(pkg.price || 0);
      if (!seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push({ name, price, type: 'epinPackage' });
      }
    });

    // 2. Joining Products (status: SHOWING)
    const products = await Product.find({ type: 'joining', status: 'SHOWING' }).sort({ mrp: 1 }).lean();
    products.forEach((prod) => {
      const name = prod.productName.trim();
      const price = Number(prod.mrp || prod.dpPrice || 350);
      if (!seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push({ name, price, dpPrice: prod.dpPrice, mrp: prod.mrp, type: 'product' });
      }
    });

    // Fallback if empty
    if (list.length === 0) {
      list.push({ name: 'Basic Package', price: 350 });
      list.push({ name: 'Elcon Anion Sanitary Pads - 8', price: 350 });
    }

    res.status(200).json({ success: true, packages: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/auth/verify-epin
 * Verify E-Pin validity and match against selected Joining Package & amount
 */
exports.verifyEpin = async (req, res) => {
  try {
    const epinNo = String(req.body.epin || req.query.epin || '').trim();
    const packageName = String(req.body.packageName || req.query.packageName || '').trim();

    if (!epinNo) {
      return res.status(400).json({ success: false, message: 'Please enter an E-Pin.' });
    }

    const foundEpin = await Epin.findOne({ epinNo });
    if (!foundEpin) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Invalid E-Pin. E-Pin does not exist in system.',
        code: 'EPIN_NOT_FOUND',
      });
    }

    if (foundEpin.status !== 'Unused') {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `E-Pin is already ${foundEpin.status.toLowerCase()}. Only unused E-Pins can be used.`,
        code: 'EPIN_ALREADY_USED',
      });
    }

    const epinCost = Number(foundEpin.cost || 0);
    let packageAmount = null;
    let matched = true;
    let mismatchMessage = '';

    if (packageName) {
      const productDoc = await Product.findOne({
        type: 'joining',
        productName: new RegExp(`^${packageName}$`, 'i'),
      }).lean();

      if (productDoc) {
        packageAmount = Number(productDoc.mrp || productDoc.dpPrice || 350);
        if (epinCost !== Number(productDoc.mrp) && epinCost !== Number(productDoc.dpPrice)) {
          matched = false;
          mismatchMessage = `E-Pin amount (₹${epinCost}) does not match selected Package amount (₹${packageAmount}).`;
        }
      } else {
        const epinPkgDoc = await EpinPackage.findOne({
          packageName: new RegExp(`^${packageName}$`, 'i'),
        }).lean();

        if (epinPkgDoc) {
          packageAmount = Number(epinPkgDoc.price || 0);
        } else {
          packageAmount = 350;
        }

        if (epinCost !== packageAmount) {
          matched = false;
          mismatchMessage = `E-Pin amount (₹${epinCost}) does not match selected Package amount (₹${packageAmount}).`;
        }
      }
    }

    res.status(200).json({
      success: matched,
      valid: true,
      matched,
      message: matched
        ? (packageName ? `E-Pin verified (₹${epinCost} matches ${packageName})` : `E-Pin is valid (Amount: ₹${epinCost})`)
        : mismatchMessage,
      epinNo: foundEpin.epinNo,
      epinName: foundEpin.epinName,
      epinAmount: epinCost,
      cost: epinCost,
      packageAmount,
      status: foundEpin.status,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
