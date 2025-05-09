const express = require("express");
const router = express.Router();
const RideController = require("../controllers/rideController");

// Create a new ride
router.post("/", RideController.createRideRequest);



module.exports = router;
