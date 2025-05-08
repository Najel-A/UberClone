const express = require("express");
const router = express.Router();
const rideController = require("../controllers/rideController");

// Request a ride
router.post("/request", rideController.requestRide);

// Create a new ride
router.post("/create", rideController.createRide);

// Update an existing ride
router.put("/:id", rideController.updateRide);

// Delete a ride
router.delete("/:id", rideController.deleteRide);

// Get rides by customer
router.get("/customer/:customerId", rideController.getCustomerRides);

// Get rides by driver
router.get("/driver/:driverId", rideController.getDriverRides);

// Get ride statistics by location
router.get("/statistics", rideController.getRideStatistics);

// Get nearby drivers
router.post("/nearby-drivers", rideController.getNearbyDrivers);

router.get("/test-redis-caching", rideController.testRedisCaching);

module.exports = router;
