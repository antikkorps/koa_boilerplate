# AGENTS.md - Development Guidelines & Best Practices

## 🎯 Project Overview

This is a professional Koa.js boilerplate implementing industry best practices for building scalable, maintainable, and secure REST APIs.

## 🏗️ Architecture Principles

### 1. **DRY (Don't Repeat Yourself)**

- **Code Reusability**: Extract common logic into utility functions, services, and middleware
- **Configuration Management**: Centralize configuration in `/src/config`
- **Model Methods**: Use Sequelize hooks and instance methods to avoid duplicating business logic
- **Middleware**: Create reusable middleware for cross-cutting concerns (auth, validation, error handling)

**Example:**
```javascript
// ❌ Bad - Repeated validation logic
router.post('/register', async (ctx) => {
  if (!ctx.request.body.email) {
    ctx.throw(400, 'Email required');
  }
  // ...
});

// ✅ Good - Reusable validation middleware
router.post('/register', validate(authValidator.register), AuthController.register);
```

### 2. **Separation of Concerns**

The project follows a layered architecture:

```
├── controllers/    # Request handling and response formatting
├── services/       # Business logic and data processing
├── models/         # Data models and database schemas
├── middleware/     # Cross-cutting concerns (auth, validation, errors)
├── routes/         # API route definitions
├── validators/     # Input validation schemas
├── config/         # Application configuration
└── utils/          # Helper functions and utilities
```

**Key Principles:**
- Controllers should be thin - delegate to services
- Services contain business logic - keep them database-agnostic where possible
- Models define data structure and simple operations
- Keep routes clean - just wire up middleware and controllers

**Example:**
```javascript
// ❌ Bad - Business logic in controller
class AuthController {
  static async register(ctx) {
    const { email, password } = ctx.request.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      ctx.throw(400, 'User exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    ctx.body = { user, token };
  }
}

// ✅ Good - Delegated to service
class AuthController {
  static async register(ctx) {
    try {
      const result = await AuthService.register(ctx.request.body);
      ctx.status = 201;
      ctx.body = { success: true, data: result };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  }
}
```

### 3. **Error Handling**

- **Global Error Handler**: All errors are caught and formatted consistently (`/src/middleware/errorHandler.js`)
- **Structured Errors**: Use `ctx.throw()` with appropriate status codes
- **Logging**: All errors are logged with context for debugging

**Example:**
```javascript
// ✅ Proper error handling
try {
  const user = await User.findByPk(userId);
  if (!user) {
    ctx.throw(404, 'User not found');
  }
  ctx.body = { success: true, data: user };
} catch (error) {
  // Caught by global error handler
  throw error;
}
```

### 4. **Security Best Practices**

#### Implemented Security Features:

1. **Helmet**: Secure HTTP headers
2. **CORS**: Controlled cross-origin requests
3. **Password Hashing**: Bcrypt with salt rounds
4. **JWT Authentication**: Stateless authentication
5. **Input Validation**: Joi schemas prevent injection attacks
6. **SQL Injection Protection**: Sequelize parameterized queries

**Security Checklist:**
- ✅ Never store passwords in plain text
- ✅ Use environment variables for secrets
- ✅ Validate all user inputs
- ✅ Use HTTPS in production
- ✅ Implement rate limiting (recommended)
- ✅ Keep dependencies updated

### 5. **Testing Strategy**

#### Unit Tests (`/tests/unit`)
- Test services in isolation
- Mock external dependencies
- Focus on business logic

#### Integration Tests (`/tests/integration`)
- Test API endpoints end-to-end
- Use test database
- Verify request/response flow

**Testing Best Practices:**
```javascript
// ✅ Good test structure
describe('AuthService', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = { email: 'test@example.com', password: 'pass123' };
      User.findOne.mockResolvedValue(null);

      // Act
      const result = await AuthService.register(userData);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
    });
  });
});
```

**Run Tests:**
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
```

## 📁 Project Structure

```
koa_boilerplate/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # Sequelize configuration
│   │   ├── logger.js    # Winston logger setup
│   │   └── swagger.js   # Swagger/OpenAPI config
│   ├── controllers/     # Request handlers
│   │   └── authController.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # JWT authentication
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── models/          # Sequelize models
│   │   ├── User.js
│   │   └── index.js
│   ├── routes/          # API routes
│   │   ├── authRoutes.js
│   │   └── index.js
│   ├── services/        # Business logic
│   │   └── authService.js
│   ├── validators/      # Joi validation schemas
│   │   └── authValidator.js
│   └── index.js         # Application entry point
├── tests/
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── logs/               # Application logs
├── .env                # Environment variables
├── .env.example        # Environment template
├── .gitignore
├── package.json
├── jest.config.js      # Jest configuration
├── AGENTS.md           # This file
└── README.md           # Project documentation
```

## 🔧 Development Guidelines

### Adding New Features

1. **Create Model** (if needed):
```javascript
// src/models/Product.js
const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL, allowNull: false }
});
```

2. **Create Service**:
```javascript
// src/services/productService.js
class ProductService {
  static async createProduct(data) {
    return await Product.create(data);
  }
}
```

3. **Create Validator**:
```javascript
// src/validators/productValidator.js
const productValidator = {
  create: Joi.object({
    name: Joi.string().required(),
    price: Joi.number().positive().required()
  })
};
```

4. **Create Controller**:
```javascript
// src/controllers/productController.js
class ProductController {
  static async create(ctx) {
    const product = await ProductService.createProduct(ctx.request.body);
    ctx.status = 201;
    ctx.body = { success: true, data: product };
  }
}
```

5. **Create Routes**:
```javascript
// src/routes/productRoutes.js
const router = new Router({ prefix: '/api/products' });
router.post('/', authenticate, validate(productValidator.create), ProductController.create);
```

6. **Add Tests**:
```javascript
// tests/unit/productService.test.js
describe('ProductService', () => {
  it('should create a product', async () => {
    // Test implementation
  });
});
```

### Code Style Guidelines

1. **Use Async/Await** instead of callbacks or raw promises
2. **Use Arrow Functions** for simple operations
3. **Descriptive Naming**: `getUserById` not `getUser`
4. **Constants**: Use UPPER_CASE for constants
5. **Error Messages**: Be specific and helpful
6. **Comments**: Explain WHY, not WHAT
7. **JSDoc**: Document public methods

### Database Migrations

While this boilerplate uses `sequelize.sync()` for simplicity, production apps should use migrations:

```bash
# Install sequelize-cli
npm install --save-dev sequelize-cli

# Initialize migrations
npx sequelize-cli init

# Create migration
npx sequelize-cli migration:generate --name add-user-role

# Run migrations
npx sequelize-cli db:migrate
```

## 🚀 API Development Workflow

1. **Define API Contract**: Document endpoint in Swagger comments
2. **Create Validator**: Define input validation schema
3. **Implement Service**: Write business logic with tests
4. **Create Controller**: Handle request/response
5. **Add Route**: Wire up middleware and controller
6. **Write Tests**: Unit and integration tests
7. **Update Documentation**: Ensure Swagger docs are current

## 📊 Environment Variables

Always use environment variables for:
- Database credentials
- API keys and secrets
- Third-party service URLs
- Feature flags
- Port numbers

Never commit `.env` files to version control.

## 🔍 Debugging

```javascript
// Use the logger instead of console.log
const logger = require('./config/logger');

logger.info('User logged in', { userId: user.id });
logger.error('Database error', { error: err.message });
logger.debug('Processing request', { body: ctx.request.body });
```

## 📝 Commit Message Guidelines

Use conventional commits:
```
feat: add product management endpoints
fix: resolve JWT token expiration issue
refactor: extract email service
test: add unit tests for auth service
docs: update API documentation
```

## 🛠️ Useful Commands

```bash
# Development
npm run dev          # Start with nodemon

# Production
npm start            # Start server

# Testing
npm test             # Run all tests
npm run test:watch   # Watch mode

# Code Quality
npm run lint         # Check code style
npm run lint:fix     # Fix code style issues
```

## 🎓 Learning Resources

- [Koa Documentation](https://koajs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## 🤝 Contributing

When contributing to this project:
1. Follow the established patterns
2. Write tests for new features
3. Update documentation
4. Keep commits atomic and well-described
5. Ensure all tests pass before committing

---

**Remember**: Clean code is not just about making things work—it's about making them maintainable, testable, and understandable for other developers (including your future self).
