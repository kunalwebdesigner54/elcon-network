const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * @desc    Manage Discount Coupon Balance
 * @route   POST /api/admin-controls/discount-coupon
 * @access  Private/Admin
 */
exports.manageDiscountCoupon = async (req, res) => {
  try {
    const { action, amount, target, memberId, transactionPassword } = req.body;

    // Verify admin transaction password
    if (!transactionPassword || !transactionPassword.toString().trim()) {
      return res.status(400).json({ success: false, message: 'Transaction password is required' });
    }
    const adminUser = await User.findById(req.user.id).select('+password +transactionPassword');
    if (!adminUser) {
      return res.status(401).json({ success: false, message: 'Admin not found' });
    }
    const isPasswordValid = adminUser.transactionPassword
      ? await adminUser.matchTransactionPassword(transactionPassword.toString().trim())
      : await adminUser.matchPassword(transactionPassword.toString().trim());
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid transaction password' });
    }

    if (!['add', 'debit'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    if (target === 'single') {
      if (!memberId) {
        return res.status(400).json({ success: false, message: 'Member ID is required for single target' });
      }
      const user = await User.findOne({ memberId: memberId.trim().toUpperCase() });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      const currentCouponBalance = Number(user.couponWalletBalance || 0);
      const legacyBalance = Number(user.discountCouponBalance || 0);
      const totalAvailable = currentCouponBalance + legacyBalance;

      if (action === 'add') {
        // Use atomic findOneAndUpdate to bypass pre-save hook issues
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          {
            $set: { discountCouponBalance: 0 },
            $inc: { couponWalletBalance: legacyBalance + parsedAmount }
          },
          { new: true }
        );
        console.log(`[COUPON] ADD single: memberId=${updatedUser.memberId}, prevTotal=${totalAvailable}, added=${parsedAmount}, newBalance=${updatedUser.couponWalletBalance}`);
        return res.json({ 
          success: true, 
          message: `Discount coupon balance updated for ${updatedUser.memberId}. New balance: ₹${updatedUser.couponWalletBalance}`,
          newBalance: updatedUser.couponWalletBalance 
        });
      } else {
        if (totalAvailable < parsedAmount) {
          return res.status(400).json({ success: false, message: 'Insufficient discount coupon balance' });
        }
        // First consolidate legacy balance, then debit
        const newBalance = totalAvailable - parsedAmount;
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          {
            $set: { 
              couponWalletBalance: newBalance,
              discountCouponBalance: 0 
            }
          },
          { new: true }
        );
        console.log(`[COUPON] DEBIT single: memberId=${updatedUser.memberId}, prevTotal=${totalAvailable}, debited=${parsedAmount}, newBalance=${updatedUser.couponWalletBalance}`);
        return res.json({ 
          success: true, 
          message: `Discount coupon balance updated for ${updatedUser.memberId}. New balance: ₹${updatedUser.couponWalletBalance}`,
          newBalance: updatedUser.couponWalletBalance 
        });
      }
    } 
    
    if (target === 'bulk') {
      // Find all active users
      const users = await User.find({ role: 'user', accountStatus: 'ACTIVE', isBlocked: { $ne: true } });
      
      if (action === 'add') {
        const bulkOps = users.map((user) => ({
          updateOne: {
            filter: { _id: user._id },
            update: {
              $set: { discountCouponBalance: 0 },
              $inc: {
                couponWalletBalance: parsedAmount + (user.discountCouponBalance || 0),
              },
            },
          },
        }));
        if (bulkOps.length > 0) {
          await User.bulkWrite(bulkOps);
        }
      } else {
        const bulkOps = users.map(u => {
          let newBalance =
            (u.couponWalletBalance || 0) + (u.discountCouponBalance || 0) - parsedAmount;
          if (newBalance < 0) newBalance = 0;
          return {
            updateOne: {
              filter: { _id: u._id },
              update: { $set: { couponWalletBalance: newBalance, discountCouponBalance: 0 } }
            }
          };

        });
        if (bulkOps.length > 0) {
          await User.bulkWrite(bulkOps);
        }
      }
      return res.json({ success: true, message: `Discount coupon balance updated for all active users` });
    }

    return res.status(400).json({ success: false, message: 'Invalid target' });
  } catch (error) {
    console.error('manageDiscountCoupon error:', error);
    res.status(500).json({ success: false, message: 'Server error managing discount coupons' });
  }
};

/**
 * @desc    Manage member wallet balance
 * @route   POST /api/admin-controls/wallet-balance
 * @access  Private/Admin
 */
exports.manageWalletBalance = async (req, res) => {
  try {
    const { action, amount, memberId } = req.body;
    const parsedAmount = Number(amount);

    if (!['add', 'debit'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid wallet action' });
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    if (!memberId) {
      return res.status(400).json({ success: false, message: 'Member ID is required' });
    }

    const user = await User.findOne({
      memberId: memberId.trim().toUpperCase(),
      role: 'user',
    }).select('memberId walletBalance');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const currentBalance = Number(user.walletBalance || 0);
    if (action === 'debit' && currentBalance < parsedAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }

    const newBalance = action === 'add'
      ? currentBalance + parsedAmount
      : currentBalance - parsedAmount;
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { walletBalance: newBalance } },
      { new: true }
    ).select('memberId walletBalance');

    return res.json({
      success: true,
      message: `Wallet balance updated for ${updatedUser.memberId}`,
      newBalance: updatedUser.walletBalance,
    });
  } catch (error) {
    console.error('manageWalletBalance error:', error);
    return res.status(500).json({ success: false, message: 'Server error managing wallet balance' });
  }
};

/**
 * @desc    Create a Sub-Admin
 * @route   POST /api/admin-controls/sub-admins
 * @access  Private/SuperAdmin
 */
exports.createSubAdmin = async (req, res) => {
  try {
    const { memberId, name, email, contactNo, password, permissions } = req.body;

    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { memberId }, { contactNo }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email, contact number, or member ID already exists.' });
    }

    const user = await User.create({
      memberId: memberId || `ADMIN${Math.floor(100000 + Math.random() * 900000)}`,
      name,
      email,
      contactNo,
      password,
      role: 'admin',
      adminType: 'SUB_ADMIN',
      permissions: permissions || [],
      accountStatus: 'ACTIVE',
    });

    res.status(201).json({ success: true, message: 'Sub-Admin created successfully', data: user });
  } catch (error) {
    console.error('createSubAdmin error:', error);
    res.status(500).json({ success: false, message: 'Failed to create Sub-Admin' });
  }
};

/**
 * @desc    Get all Sub-Admins
 * @route   GET /api/admin-controls/sub-admins
 * @access  Private/SuperAdmin
 */
exports.getSubAdmins = async (req, res) => {
  try {
    const subAdmins = await User.find({ role: 'admin', adminType: 'SUB_ADMIN' })
      .select('-password -plainPassword -transactionPassword -plainTransactionPassword');
    res.json({ success: true, data: subAdmins });
  } catch (error) {
    console.error('getSubAdmins error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch Sub-Admins' });
  }
};

/**
 * @desc    Update a Sub-Admin
 * @route   PUT /api/admin-controls/sub-admins/:id
 * @access  Private/SuperAdmin
 */
exports.updateSubAdmin = async (req, res) => {
  try {
    const { name, contactNo, permissions, accountStatus, password } = req.body;
    const subAdmin = await User.findOne({ _id: req.params.id, role: 'admin', adminType: 'SUB_ADMIN' });
    
    if (!subAdmin) {
      return res.status(404).json({ success: false, message: 'Sub-Admin not found' });
    }

    if (name) subAdmin.name = name;
    if (contactNo) subAdmin.contactNo = contactNo;
    if (permissions) subAdmin.permissions = permissions;
    if (accountStatus) subAdmin.accountStatus = accountStatus;
    if (password && password.length >= 6) {
      subAdmin.password = password; 
      subAdmin.plainPassword = password;
    }

    await subAdmin.save();
    res.json({ success: true, message: 'Sub-Admin updated successfully' });
  } catch (error) {
    console.error('updateSubAdmin error:', error);
    res.status(500).json({ success: false, message: 'Failed to update Sub-Admin' });
  }
};

/**
 * @desc    Delete a Sub-Admin
 * @route   DELETE /api/admin-controls/sub-admins/:id
 * @access  Private/SuperAdmin
 */
exports.deleteSubAdmin = async (req, res) => {
  try {
    const subAdmin = await User.findOne({ _id: req.params.id, role: 'admin', adminType: 'SUB_ADMIN' });
    if (!subAdmin) {
      return res.status(404).json({ success: false, message: 'Sub-Admin not found' });
    }
    await subAdmin.deleteOne();
    res.json({ success: true, message: 'Sub-Admin deleted successfully' });
  } catch (error) {
    console.error('deleteSubAdmin error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete Sub-Admin' });
  }
};

/**
 * @desc    Change Admin Password or Transaction Password
 * @route   POST /api/admin-controls/change-passwords
 * @access  Private/Admin
 */
exports.changePasswords = async (req, res) => {
  try {
    const { type, oldPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id).select('+password +transactionPassword');
    
    if (type === 'login') {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect old password' });
      }
      user.password = newPassword;
      user.plainPassword = newPassword;
    } else if (type === 'transaction') {
      if (user.transactionPassword) {
        const isMatch = await bcrypt.compare(oldPassword, user.transactionPassword);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Incorrect old transaction password' });
        }
      }
      
      const salt = await bcrypt.genSalt(10);
      user.transactionPassword = await bcrypt.hash(newPassword, salt);
      user.plainTransactionPassword = newPassword;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid password type' });
    }

    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('changePasswords error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};

// ==========================================
// Toggle Rank Visibility
// ==========================================
exports.toggleRankVisibility = async (req, res) => {
  try {
    const { memberId, isVisible } = req.body;
    
    if (!memberId) {
      return res.status(400).json({ success: false, message: 'Member ID is required' });
    }

    const user = await User.findOne({ memberId: memberId.toUpperCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    user.isRankVisible = isVisible;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Rank visibility set to ${isVisible ? 'SHOW' : 'HIDE'} for member ${user.memberId}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
