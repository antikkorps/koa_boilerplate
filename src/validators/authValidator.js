const Joi = require('joi');

const authValidator = {
  /**
   * Validate registration data
   */
  register: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .max(100)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password must not exceed 100 characters',
        'any.required': 'Password is required'
      }),
    firstName: Joi.string()
      .max(50)
      .optional()
      .allow(''),
    lastName: Joi.string()
      .max(50)
      .optional()
      .allow('')
  }),

  /**
   * Validate login data
   */
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  })
};

module.exports = authValidator;
