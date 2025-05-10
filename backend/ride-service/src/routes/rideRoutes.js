const express = require("express");
const router = express.Router();
const RideController = require("../controllers/rideController");

// Create a new ride
router.post("/", RideController.createRideRequest);
router.get("/getRides", RideController.getNearbyRideRequests);
router.post("/acceptRide/:id", RideController.acceptRideRequest);
router.post("/rideCompleted", RideController.rideCompleted);


module.exports = router;
