require('dotenv').config();
const sequelize = require('./src/config/db');
const app = require('./src/app');
const CustomerWallet = require('./src/models/CustomerWallet');
const DriverWallet = require('./src/models/DriverWallet');
const PORT = process.env.PORT || 3004;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync the database (optional: use { alter: true } or { force: true } for development)
    await sequelize.sync();
    console.log('Database synchronized.');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1);
  }
})();