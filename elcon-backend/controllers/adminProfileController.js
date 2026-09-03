const User = require('../models/User');

// @desc    Update admin login password
// @route   PUT /api/admin-profile/password
// @access  Private/Admin
exports.updateAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current password is correct
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    // Check if user provided same password
    const isSame = await user.matchPassword(newPassword);
    if (isSame) {
        return res.status(400).json({ message: 'New password cannot be the same as the old password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating admin password:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update admin transaction password
// @route   PUT /api/admin-profile/transaction-password
// @access  Private/Admin
exports.updateAdminTransactionPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+transactionPassword');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current transaction password is correct
    const isMatch = await user.matchTransactionPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current transaction password' });
    }

    // Check if user provided same password
    const isSame = await user.matchTransactionPassword(newPassword);
    if (isSame) {
        return res.status(400).json({ message: 'New transaction password cannot be the same as the old password' });
    }

    user.transactionPassword = newPassword;
    await user.save();

    res.status(200).json({ message: 'Transaction password updated successfully' });
  } catch (error) {
    console.error('Error updating admin transaction password:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
