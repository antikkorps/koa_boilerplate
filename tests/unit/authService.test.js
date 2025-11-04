const AuthService = require('../../src/services/authService');
const User = require('../../src/models/User');

// Mock User model
jest.mock('../../src/models/User');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const user = {
        id: '123',
        email: 'test@example.com'
      };

      const token = AuthService.generateToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const user = {
        id: '123',
        email: 'test@example.com'
      };

      const token = AuthService.generateToken(user);
      const decoded = AuthService.verifyToken(token);

      expect(decoded.id).toBe(user.id);
      expect(decoded.email).toBe(user.email);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        AuthService.verifyToken(invalidToken);
      }).toThrow('Invalid or expired token');
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const mockUser = {
        id: '123',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        toJSON: jest.fn().mockReturnValue({
          id: '123',
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName
        })
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);

      const result = await AuthService.register(userData);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(User.create).toHaveBeenCalledWith(userData);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(userData.email);
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue({ id: '123', email: userData.email });

      await expect(AuthService.register(userData))
        .rejects
        .toThrow('User with this email already exists');
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const credentials = {
        email: 'user@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: '123',
        email: credentials.email,
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        update: jest.fn(),
        toJSON: jest.fn().mockReturnValue({
          id: '123',
          email: credentials.email
        })
      };

      User.findOne.mockResolvedValue(mockUser);

      const result = await AuthService.login(credentials.email, credentials.password);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: credentials.email } });
      expect(mockUser.comparePassword).toHaveBeenCalledWith(credentials.password);
      expect(mockUser.update).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
    });

    it('should throw error for invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(AuthService.login('user@example.com', 'wrongpassword'))
        .rejects
        .toThrow('Invalid credentials');
    });

    it('should throw error for disabled account', async () => {
      const mockUser = {
        id: '123',
        email: 'user@example.com',
        isActive: false
      };

      User.findOne.mockResolvedValue(mockUser);

      await expect(AuthService.login('user@example.com', 'password123'))
        .rejects
        .toThrow('Account is disabled');
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const mockUser = {
        id: '123',
        email: 'user@example.com',
        toJSON: jest.fn().mockReturnValue({
          id: '123',
          email: 'user@example.com'
        })
      };

      User.findByPk.mockResolvedValue(mockUser);

      const result = await AuthService.getUserById('123');

      expect(User.findByPk).toHaveBeenCalledWith('123');
      expect(result.id).toBe('123');
    });

    it('should throw error if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(AuthService.getUserById('nonexistent'))
        .rejects
        .toThrow('User not found');
    });
  });
});
