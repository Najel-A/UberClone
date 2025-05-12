const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const { uploadVideo, uploadImage } = require("../utils/multer");
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

// Upload driver profile picture
router.post('/:id/profile-picture', uploadImage.single('profilePicture'), driverController.uploadProfilePicture);

// Add Review and Rating
router.post('/:id/review', driverController.addReviewAndRating);

// Get Driver by ID
router.get("/:id", driverController.getDriver);

// Update Driver
router.put("/:id", validateDriverUpdate, driverController.updateDriver);

// Delete Driver
router.delete("/:id", driverController.deleteDriver);

// Get Driver Video
router.get("/:id/video", driverController.getDriverVideo);

// Upload Driver Video
router.post("/:id/video", uploadVideo.single('video'), driverController.uploadDriverVideo);

// Update Driver Status and Location
router.put("/:id/status", driverController.updateDriverStatusAndLocation);

module.exports = router;
