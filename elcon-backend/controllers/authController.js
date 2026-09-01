// p2pbackend/controllers/authController.js

const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Epin = require('../models/Epin');
const SiteSetting = require('../models/SiteSetting');

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

    let joiningAmount = 0;
    let foundEpin = null;
    if (epin) {
      foundEpin = await Epin.findOne({ epinNo: epin });
      if (!foundEpin) {
        return res.status(404).json({ success: false, message: 'E-Pin not found', code: 'EPIN_NOT_FOUND' });
      }
      if (foundEpin.status !== 'Unused') {
        return res.status(400).json({ success: false, message: 'E-Pin is already used or deleted', code: 'EPIN_INVALID' });
      }
      joiningAmount = foundEpin.cost || 0;
    }

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
