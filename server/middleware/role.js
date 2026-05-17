// Role-Based Access Control (RBAC) Middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role (${req.user?.role || 'None'}) is not allowed to access this resource`);
    }
    next();
  };
};
