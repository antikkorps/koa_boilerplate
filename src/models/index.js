const { sequelize } = require('../config/database');
const User = require('./User');

// Initialize all models
const models = {
  User
};

// Sync database (creates tables if they don't exist)
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✓ Database synchronized successfully');
  } catch (error) {
    console.error('✗ Database sync failed:', error.message);
    throw error;
  }
};

module.exports = {
  ...models,
  sequelize,
  syncDatabase
};
