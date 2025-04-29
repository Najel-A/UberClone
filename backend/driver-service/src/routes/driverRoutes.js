const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { validateDriverData } = require('../utils/validation');

// Login Driver
router.post('/login', driverController.loginDriver);

// Logout Driver
router.post('/logout', driverController.logoutDriver);

// Create Driver
router.post('/', 
  validateDriverData, 
  driverController.createDriver);

// Get Driver by ID
router.get('/:id', driverController.getDriver);

// Update Driver
router.put('/:id', 
  validateDriverData, 
  driverController.updateDriver);

// Delete Driver
router.delete('/:id', driverController.deleteDriver);

// List Drivers (with optional search)
router.get('/', driverController.listDrivers);

// Get Driver Video
router.get('/:id/video', driverController.getDriverVideo);

module.exports = router;