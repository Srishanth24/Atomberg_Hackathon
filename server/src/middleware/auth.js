import jwt from 'jsonwebtoken';
import User from '../../models/User.js';

/**
 * Middleware to verify JWT token and attach user to req.user
 * Must be applied before authorizeRoles middleware
 */
export const protect = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.slice(7)
            : null;

        if (!token) {
            res.status(401);
            throw new Error('Authentication required. No token provided.');
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

        // Fetch user from database
        const user = await User.findById(decoded.id).lean();

        if (!user) {
            res.status(401);
            throw new Error('User not found. Token may be invalid.');
        }

        // Attach user to request
        req.user = {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            managerId: user.managerId,
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(401);
            throw new Error('Invalid token. Authentication failed.');
        }
        if (error.name === 'TokenExpiredError') {
            res.status(401);
            throw new Error('Token expired. Please login again.');
        }
        throw error;
    }
};
