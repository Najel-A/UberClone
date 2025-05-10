const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
// const { validateAdmin } = require('../middleware/auth');

// Apply admin validation middleware to all routes
//router.use(validateAdmin); // Apply this later

// Admin Registration
router.post('/signup', adminController.createAdmin);

// Admin Update
router.put('/update/:id', adminController.updateAdmin);

// Admin Login
router.post('/login', adminController.loginAdmin);

// Driver Management
router.post('/drivers', adminController.addDriver);

// Customer Management
router.post('/customers', adminController.addCustomer);

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
router.post('/logout', adminController.logoutAdmin);

module.exports = router;