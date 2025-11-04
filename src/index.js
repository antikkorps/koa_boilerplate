const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const helmet = require('koa-helmet');
const cors = require('@koa/cors');
const { koaSwagger } = require('koa2-swagger-ui');
require('dotenv').config();

const logger = require('./config/logger');
const { testConnection } = require('./config/database');
const { syncDatabase } = require('./models');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = new Koa();

// Error handling
app.use(errorHandler);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(bodyParser({
  enableTypes: ['json', 'form'],
  jsonLimit: '10mb',
  formLimit: '10mb',
  textLimit: '10mb'
}));

// Request logger middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`);
});

// Swagger documentation
app.use(koaSwagger({
  routePrefix: '/api-docs',
  swaggerOptions: {
    spec: swaggerSpec
  }
}));

// API routes
app.use(routes.routes());
app.use(routes.allowedMethods());

// Error event listener
app.on('error', (err, ctx) => {
  logger.error('Server error:', {
    error: err.message,
    stack: err.stack,
    url: ctx?.url,
    method: ctx?.method
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database
    await syncDatabase();

    // Start listening
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${ENV} mode`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

startServer();

module.exports = app;
