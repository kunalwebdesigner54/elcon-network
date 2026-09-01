// Middleware to check if an admin has a specific permission
// This should be used after the `protect` and `admin` middlewares
const authorizePermission = (permission) => {
  return (req, res, next) => {
    // If the user is a SUPER_ADMIN, they have all permissions
    if (req.user && req.user.adminType === 'SUPER_ADMIN') {
      return next();
    }

    // If the user is a SUB_ADMIN, check if they have the specific permission
    if (req.user && req.user.adminType === 'SUB_ADMIN' && req.user.permissions && req.user.permissions.includes(permission)) {
      return next();
    }

    // Otherwise, deny access
    return res.status(403).json({ message: 'Not authorized to access this resource. Missing permission: ' + permission });
  };
};

module.exports = authorizePermission;
