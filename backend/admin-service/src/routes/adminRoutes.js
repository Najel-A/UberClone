const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
// const { validateAdmin } = require('../middleware/auth');

// Apply admin validation middleware to all routes
//router.use(validateAdmin); // Apply this later

// Admin Registration
router.post("/signup", adminController.createAdmin);

// Admin Update
router.put("/update/:id", adminController.updateAdmin);

// Admin Login
router.post("/login", adminController.loginAdmin);

// Driver Management
router.get(
  "/drivers",
  (req, res, next) => {
    console.log("GET /drivers route hit");
    next();
  },
  adminController.getAllDrivers
);
router.post("/drivers", adminController.addDriver);
router.put("/drivers/:id", adminController.updateDriver);
router.delete("/drivers/:id", adminController.deleteDriver);

router.get("/drivers/email/:email", adminController.getDriverByEmail);

// Customer Management
router.post("/customers", adminController.addCustomer);
router.put("/customers/:id", adminController.updateCustomer);
router.delete("/customers/:id", adminController.deleteCustomer);
router.get("/customers", adminController.getAllCustomers);
router.get("/customers/email/:email", adminController.getCustomerByEmail);

// Bill Management
router.get("/billing", adminController.getAllBills);
router.get("/billing/:id", adminController.getBillById);

// Account Review
// router.get('/accounts/:id', adminController.getAccount);

// Statistics
// router.get('/statistics', adminController.getStatistics);

// Graphs/Charts
// router.get('/graphs', adminController.getGraphData);

// Bill Management
// router.get('/bills', adminController.searchBills);
// router.get('/bills/:id', adminController.getBill);

// Logout
router.post("/logout", adminController.logoutAdmin);

module.exports = router;
