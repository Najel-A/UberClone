const express = require("express");
const router = express.Router();
const RideController = require("../controllers/rideController");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Create a new ride
router.post("/", RideController.createRideRequest);
router.get("/getRides", RideController.getNearbyRideRequests);
router.post("/acceptRide/:id", RideController.acceptRideRequest);
router.post("/rideCompleted", RideController.rideCompleted);
router.get('/driver/:driverId', RideController.getDriverRides);
router.get('/customer/:customerId', RideController.getCustomerRides);
router.get('/:rideId', RideController.getRideById);
router.post('/:rideId/upload-images', upload.array('images'), RideController.uploadRideImages);
router.get('/:rideId/images', RideController.getRideImages);
router.post('/:rideId/cancel', RideController.cancelRideRequest);

module.exports = router;
