const AuthService = require('../services/authService');
const logger = require('../config/logger');

class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  static async register(ctx) {
    try {
      const result = await AuthService.register(ctx.request.body);

      logger.info(`New user registered: ${result.user.email}`);

      ctx.status = 201;
      ctx.body = {
        success: true,
        data: result
      };
    } catch (error) {
      logger.error('Registration error:', error.message);
      ctx.throw(400, error.message);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  static async login(ctx) {
    try {
      const { email, password } = ctx.request.body;
      const result = await AuthService.login(email, password);

      logger.info(`User logged in: ${email}`);

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: result
      };
    } catch (error) {
      logger.error('Login error:', error.message);
      ctx.throw(401, error.message);
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  static async getProfile(ctx) {
    try {
      const userId = ctx.state.user.id;
      const user = await AuthService.getUserById(userId);

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: { user }
      };
    } catch (error) {
      logger.error('Get profile error:', error.message);
      ctx.throw(404, error.message);
    }
  }

  /**
   * Health check endpoint
   * GET /api/auth/health
   */
  static async healthCheck(ctx) {
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: 'Auth service is healthy',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = AuthController;
