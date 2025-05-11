const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const {
  validateDriverData,
  validateDriverUpdate,
} = require("../utils/validation");

// Login Driver
router.post("/login", driverController.loginDriver);

// Logout Driver
router.post("/logout", driverController.logoutDriver);

// Create Driver
router.post("/signup", validateDriverData, driverController.createDriver);

// List Drivers (with optional search)
router.get("/", driverController.listDrivers);

// Get Driver by Email
router.get("/email/:email", driverController.getDriverByEmail);

// Get Driver by ID
router.get("/:id", driverController.getDriver);

// Update Driver
router.put("/:id", validateDriverUpdate, driverController.updateDriver);

// Delete Driver
router.delete("/:id", driverController.deleteDriver);

// Get Driver Video
router.get("/:id/video", driverController.getDriverVideo);

// Update Driver Status and Location
router.put("/:id/status", driverController.updateDriverStatusAndLocation);

module.exports = router;
