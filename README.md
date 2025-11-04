# Koa.js Boilerplate

A professional, production-ready Koa.js boilerplate with authentication, Sequelize ORM, and industry best practices.

## Features

- **Koa.js**: Modern, lightweight Node.js web framework
- **Authentication**: JWT-based authentication system
- **Database**: PostgreSQL with Sequelize ORM
- **Security**: Helmet, CORS, bcrypt password hashing
- **Validation**: Request validation with Joi
- **Documentation**: Swagger/OpenAPI integration
- **Testing**: Jest with unit and integration tests
- **Logging**: Winston for structured logging
- **Code Quality**: ESLint configuration
- **Hot Reload**: Nodemon for development

## Project Structure

```
koa_boilerplate/
├── src/
│   ├── config/         # Configuration files (database, logger, swagger)
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware (auth, validation, errors)
│   ├── models/         # Sequelize models
│   ├── routes/         # API routes
│   ├── services/       # Business logic layer
│   ├── validators/     # Joi validation schemas
│   └── index.js        # Application entry point
├── tests/
│   ├── unit/          # Unit tests
│   └── integration/   # Integration tests
├── logs/              # Application logs
├── AGENTS.md          # Development guidelines and best practices
└── README.md          # This file
```

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd koa_boilerplate
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=koa_boilerplate
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Create PostgreSQL database

```bash
createdb koa_boilerplate
```

Or using psql:

```sql
CREATE DATABASE koa_boilerplate;
```

### 5. Start the development server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| GET | `/api/auth/health` | Health check | No |

### API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **Root endpoint**: `http://localhost:3000/`

## Usage Examples

### Register a new user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt-token-here"
  }
}
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get current user profile

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer your-jwt-token"
```

## Testing

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run tests with coverage

```bash
npm test -- --coverage
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with hot reload |
| `npm test` | Run tests with coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Check code style |
| `npm run lint:fix` | Fix code style issues |

## Security Features

- **Helmet**: Secure HTTP headers
- **CORS**: Cross-Origin Resource Sharing configured
- **JWT**: Stateless authentication
- **Bcrypt**: Password hashing with salt
- **Joi**: Input validation to prevent injection attacks
- **Sequelize**: Protection against SQL injection

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | koa_boilerplate |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | password |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRES_IN` | JWT expiration time | 24h |
| `CORS_ORIGIN` | Allowed CORS origin | * |

## Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | STRING | User email (unique) |
| password | STRING | Hashed password |
| firstName | STRING | User first name |
| lastName | STRING | User last name |
| isActive | BOOLEAN | Account status |
| lastLogin | DATE | Last login timestamp |
| createdAt | DATE | Creation timestamp |
| updatedAt | DATE | Update timestamp |

## Development Guidelines

Please read [AGENTS.md](./AGENTS.md) for detailed development guidelines, best practices, and architectural patterns used in this project.

Key principles:
- **DRY** (Don't Repeat Yourself)
- **Separation of Concerns**
- **Clean Code**
- **Test-Driven Development**
- **Security First**

## Adding New Features

1. Create model in `src/models/`
2. Create service in `src/services/`
3. Create validator in `src/validators/`
4. Create controller in `src/controllers/`
5. Create routes in `src/routes/`
6. Write tests in `tests/`
7. Update Swagger documentation

See [AGENTS.md](./AGENTS.md) for detailed examples.

## Troubleshooting

### Database connection error

- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if database exists: `psql -l`

### Port already in use

Change the `PORT` in `.env` or kill the process:

```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

### JWT token errors

- Ensure `JWT_SECRET` is set in `.env`
- Verify token format: `Bearer <token>`
- Check token expiration

## Production Deployment

### Recommendations

1. **Use environment variables** for all configuration
2. **Enable HTTPS** (Helmet helps, but use a reverse proxy)
3. **Set up rate limiting** (not included in boilerplate)
4. **Use connection pooling** (already configured in Sequelize)
5. **Set `NODE_ENV=production`**
6. **Use process manager** (PM2, systemd)
7. **Set up monitoring** (New Relic, Datadog, etc.)
8. **Regular security updates** (`npm audit`)
9. **Database migrations** instead of `sync()`
10. **Log aggregation** (ELK stack, CloudWatch)

### PM2 Example

```bash
npm install -g pm2
pm2 start src/index.js --name koa-api
pm2 startup
pm2 save
```

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues and questions:
- Open an issue on GitHub
- Check [AGENTS.md](./AGENTS.md) for development guidelines

## Acknowledgments

Built with:
- [Koa.js](https://koajs.com/)
- [Sequelize](https://sequelize.org/)
- [JWT](https://jwt.io/)
- [Jest](https://jestjs.io/)
- [Winston](https://github.com/winstonjs/winston)
- [Joi](https://joi.dev/)
