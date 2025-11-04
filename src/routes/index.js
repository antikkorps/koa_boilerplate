const Router = require('koa-router');
const authRoutes = require('./authRoutes');

const router = new Router();

// Mount routes
router.use(authRoutes.routes()).use(authRoutes.allowedMethods());

// Root endpoint
router.get('/', async (ctx) => {
  ctx.body = {
    success: true,
    message: 'Welcome to Koa Boilerplate API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      docs: '/api-docs'
    }
  };
});

module.exports = router;
