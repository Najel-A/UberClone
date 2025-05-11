const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { validateDriverData, validateDriverUpdate } = require('../utils/validation');

// Login Driver
router.post('/login', driverController.loginDriver);

// Logout Driver
router.post('/logout', driverController.logoutDriver);

// Create Driver
router.post('/signup', 
  validateDriverData, 
  driverController.createDriver);

// Add Review and Rating
router.post('/:id/review', driverController.addReviewAndRating);

// Get Driver by ID
router.get('/:id', driverController.getDriver);

// Update Driver
router.put('/:id', 
  validateDriverUpdate, 
  driverController.updateDriver);

// Delete Driver
router.delete('/:id', driverController.deleteDriver);

// List Drivers (with optional search)
router.get('/', driverController.listDrivers);

// Get Driver Video
router.get('/:id/video', driverController.getDriverVideo);

// Update Driver Status and Location
router.put('/:id/status', driverController.updateDriverStatusAndLocation);

module.exports = router;