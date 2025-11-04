const logger = require('../config/logger');

/**
 * Global error handling middleware
 */
const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal server error';

    // Log error
    logger.error('Error occurred:', {
      status,
      message,
      stack: err.stack,
      url: ctx.url,
      method: ctx.method
    });

    // Set response
    ctx.status = status;
    ctx.body = {
      success: false,
      error: {
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }
    };

    // Emit error event for monitoring
    ctx.app.emit('error', err, ctx);
  }
};

module.exports = errorHandler;
