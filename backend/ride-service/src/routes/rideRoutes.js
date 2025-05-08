const express = require("express");
const router = express.Router();
const RideController = require("../controllers/rideController");

// Request a ride
router.post("/request", RideController.requestRide);

// Create a new ride
router.post("/create", RideController.createRide);

// Update an existing ride
router.put("/:id", RideController.updateRide);

// Delete a ride
router.delete("/:id", RideController.deleteRide);

// Get rides by customer
router.get("/customer/:customerId", RideController.getCustomerRides);

// Get rides by driver
router.get("/driver/:driverId", RideController.getDriverRides);

// Get ride statistics by location
router.get("/statistics", RideController.getRideStatistics);

// Get nearby drivers
router.post("/nearby-drivers", RideController.getNearbyDrivers);

router.get("/test-redis-caching", RideController.testRedisCaching);

module.exports = router;
