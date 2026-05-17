import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';

// Protect routes - verifies JWT
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      // In a real app, you'd look up the user in DB:
      // req.user = await User.findById(decoded.id).select('-password');
      req.user = decoded; // Mocking decoded user
      
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});
