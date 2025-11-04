/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Koa middleware function
 */
const validate = (schema) => {
  return async (ctx, next) => {
    try {
      const { error, value } = schema.validate(ctx.request.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));

        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            message: 'Validation failed',
            details: errors
          }
        };
        return;
      }

      // Replace request body with validated value
      ctx.request.body = value;

      await next();
    } catch (err) {
      ctx.throw(500, 'Validation error occurred');
    }
  };
};

module.exports = validate;
