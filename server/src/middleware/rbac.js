// Role-Based Access Control (RBAC) Middleware
// Checks that the authenticated user's role is in the list of allowed roles.
// Must be used AFTER protect middleware which populates req.user.

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // req.user should be set by protect middleware
    if (!req.user) {
      res.status(401);
      throw new Error('User not authenticated. Please apply protect middleware first.');
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role '${req.user.role}' is not allowed to access this resource`);
    }

    next();
  };
};

