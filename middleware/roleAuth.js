const roleAuth = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        console.log('❌ No user found in request');
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }

      console.log(`🔍 User role check: ${req.user.role}, Required roles: ${allowedRoles.join(', ')}`);

      if (!allowedRoles.includes(req.user.role)) {
        console.log(`❌ Access denied - User role '${req.user.role}' not in allowed roles [${allowedRoles.join(', ')}]`);
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      console.log(`✅ Access granted for role: ${req.user.role}`);
      next();
    } catch (error) {
      console.error('Role auth middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error in authorization.'
      });
    }
  };
};

module.exports = roleAuth;
