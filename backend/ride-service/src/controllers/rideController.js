const RideService = require("../services/RideService");
const LocationService = require("../services/LocationService");
const { emitRideEvent } = require("../events/rideRequest/rideRequestProducer");
const redisClient = require("../config/redis");
const Ride = require('../models/Ride');
const { simulateRide } = require("../utils/simulateRide");
const {emitCompletedRideEvent} = require('../events/rideCompleted/rideCompletedProducer');

exports.createRideRequest = async (req, res, next) => {
  try {
    const rideData = req.body;
    // Needed for MongoDB geospatial
    rideData.pickupPoint = {
      type: 'Point',
      coordinates: [
        rideData.pickupLocation.longitude,
        rideData.pickupLocation.latitude
      ]
    };
    console.log("Received ride request:", rideData);

    if (
      !rideData.customerId ||
      !rideData.pickupLocation ||
      !rideData.dropoffLocation ||
      !rideData.dateTime ||
      !rideData.passenger_count ||
      !rideData.price
    ) {
      return res.status(400).json({ message: "Missing required ride information" });
    }
    // save to db 
    await emitRideEvent(rideData);
    res.status(202).json({ message: "Ride request received and being processed" });
  } catch (error) {
    next(error);
  }
};


// Match Driver function
exports.getNearbyRideRequests = async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  try {
    const rides = await Ride.find({
      driverId: null, // ride not yet accepted
      pickupPoint: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: 16093 // 10 miles in meters
        }
      }
    });

    res.json(rides);
  } catch (error) {
    console.error('Error fetching nearby rides:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.acceptRideRequest = async (req, res, next) => {
  try {
    const { id } = req.params; // ride ID
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({ message: "Driver ID is required" });
    }

    const updatedRide = await RideService.updateRide(id, { driverId });

    if (!updatedRide) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.status(200).json({ message: "Ride accepted", ride: updatedRide });
  } catch (error) {
    next(error);
  }
};
updateRide = async (rideId, updateData) => {
  return await Ride.findByIdAndUpdate(rideId, updateData, { new: true });
};

exports.rideCompleted = async (req, res) => {
  emitCompletedRideEvent(req.params.id);

  return res.status(202).json({ message: "Ride completed" });
};


// exports.assignRide = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const driverId = req.body;

//     RideService.assignRide(id, driverId);
//     res.status(200).json({message: "Ride Accepted Confirmed"})
//   } catch (error){
//     next(error);
//   }
// }

// // Starts ride for WS
// exports.handleRideStart = async (req, res) => {
//   const { rideId, start, end } = req.body;

//   simulateRide(rideId, start, end); // Don't await — let it stream in background

//   res.status(200).json({ message: "Ride simulation started" });
// };


// // ToDO: Send updates to the ride via method or WS?
// exports.updateRide = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     if (!id) {
//       return res.status(400).json({ message: "Ride ID is required" });
//     }

//     const updatedRide = await RideService.updateRide(id, updateData);

//     if (!updatedRide) {
//       return res.status(404).json({ message: "Ride not found" });
//     }

//     await emitRideEvent("ride.updated", updatedRide);
//     res.json(updatedRide);
//   } catch (error) {
//     next(error);
//   }
// };

// exports.deleteRide = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({ message: "Ride ID is required" });
//     }

//     const deletedRide = await RideService.deleteRide(id);

//     if (!deletedRide) {
//       return res.status(404).json({ message: "Ride not found" });
//     }

//     // await emitRideEvent('ride.cancelled', deletedRide);
//     res.json({ message: "Ride deleted successfully" });
//   } catch (error) {
//     next(error);
//   }
// };

exports.getCustomerRides = async (req, res, next) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    const rides = await RideService.getRidesByCustomer(customerId);

    if (!rides || rides.length === 0) {
      return res.status(404).json({ message: "No rides found for this customer" });
    }

    res.json(rides);
  } catch (error) {
    next(error);
  }
};

exports.getDriverRides = async (req, res, next) => {
  try {
    const { driverId } = req.params;

    if (!driverId) {
      return res.status(400).json({ message: "Driver ID is required" });
    }

    const rides = await RideService.getRidesByDriver(driverId);

    if (!rides || rides.length === 0) {
      return res.status(404).json({ message: "No rides found for this driver" });
    }

    res.json(rides);
  } catch (error) {
    next(error);
  }
};

exports.getRideStatistics = async (req, res, next) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({ message: "Location query parameter is required" });
    }

    const stats = await RideService.getRideStatisticsByLocation(location);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

exports.getNearbyDrivers = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Both latitude and longitude are required" });
    }

    const customerLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    const nearbyDrivers = await LocationService.findDriversWithinRadiusWithCache(
      customerLocation,
      10,
      redisClient
    );

    res.json(nearbyDrivers);
  } catch (error) {
    next(error);
  }
};

exports.testRedisCaching = async (req, res, next) => {
  try {
    const result = await LocationService.testRedisCaching(redisClient);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
