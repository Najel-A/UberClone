require("dotenv").config();
const sequelize = require("./src/config/db");
const app = require("./src/app");
const CustomerWallet = require("./src/models/CustomerWallet");
const DriverWallet = require("./src/models/DriverWallet");
const PORT = process.env.PORT || 3001;
const billingConsumer = require("./src/events/billing/billingConsumer");
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    // Force sync the database to create tables
    await sequelize.sync({ force: true });
    console.log("Database tables created successfully.");

    await billingConsumer.startBillingConsumer();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    process.exit(1);
  }
})();
