export const requireRole = (roles) => {
  return (req, res, next) => {
    // In a real app, req.user would be populated by authentication middleware
    const userRole = req.headers['x-user-role'] || 'employee';
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};
