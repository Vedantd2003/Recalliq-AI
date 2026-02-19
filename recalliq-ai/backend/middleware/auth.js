import { verifyAccessToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

// Changed name from 'authenticate' to 'protect' to match your routes
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required. Please log in.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return errorResponse(res, 'Invalid token format.', 401);
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Session expired. Please refresh your token.', 401);
      }
      return errorResponse(res, 'Invalid token. Please log in again.', 401);
    }

    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user) {
      return errorResponse(res, 'User no longer exists.', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated. Please contact support.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error('Authentication middleware error:', err);
    return errorResponse(res, 'Authentication failed.', 500);
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401);
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'You do not have permission to perform this action.', 403);
    }
    next();
  };
};

export const requireCredits = (amount = 1) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401);
    }
    if (req.user.credits < amount) {
      return errorResponse(res, `Insufficient credits. You need ${amount} credits but have ${req.user.credits}.`, 402);
    }
    next();
  };
};