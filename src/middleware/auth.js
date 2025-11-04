const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

/**
 * JWT authentication middleware
 */
const authenticate = async (ctx, next) => {
  try {
    // Get token from header
    const authHeader = ctx.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ctx.throw(401, 'No token provided');
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database
    const user = await User.findByPk(decoded.id);

    if (!user) {
      ctx.throw(401, 'User not found');
    }

    if (!user.isActive) {
      ctx.throw(401, 'Account is disabled');
    }

    // Attach user to context
    ctx.state.user = user.toJSON();

    await next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      ctx.throw(401, 'Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      ctx.throw(401, 'Token expired');
    } else {
      throw error;
    }
  }
};

/**
 * Optional authentication middleware (doesn't throw if no token)
 */
const optionalAuth = async (ctx, next) => {
  try {
    const authHeader = ctx.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (user && user.isActive) {
        ctx.state.user = user.toJSON();
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }

  await next();
};

module.exports = {
  authenticate,
  optionalAuth
};
