const RideService = require("../services/RideService");
const LocationService = require("../services/LocationService");
const { emitRideEvent } = require("../events/rideRequest/rideRequestProducer");
const redisClient = require("../config/redis");
const Ride = require('../models/Ride');
const { simulateRide } = require("../utils/simulateRide");
const {emitCompletedRideEvent} = require('../events/rideCompleted/rideCompletedProducer');
const axios = require('axios');

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

    // Fetch customer SSN from customer-service if not already SSN
    let customerId = rideData.customerId;
    if (!/^\d{3}-\d{2}-\d{4}$/.test(customerId)) {
      // Not in SSN format, fetch from customer-service
      const customerServiceUrl = process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3000/api/customers';
      const customerRes = await axios.get(`${customerServiceUrl}/${customerId}`);
      customerId = customerRes.data._id;
    }
    rideData.customerId = customerId;

    // Check customer wallet balance before booking
    try {
      const billingServiceUrl = process.env.BILLING_SERVICE_URL || 'http://localhost:3004';
      const walletRes = await axios.get(`${billingServiceUrl}/api/billing/getCustomerWallet/${customerId}`);
      const balance = walletRes.data.balance;
      if (balance < rideData.price) {
        return res.status(400).json({ message: 'Insufficient wallet balance to book this ride.' });
      }
    } catch (err) {
      return res.status(500).json({ message: 'Failed to check wallet balance', error: err.message });
    }

    // Save to DB immediately and return ride object
    const ride = await Ride.create(rideData);
    // Optionally emit Kafka event after saving
    await emitRideEvent(ride.toObject());
    res.status(201).json(ride);
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

    // Fetch the ride
    const ride = await Ride.findById(id);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
    if (ride.status !== 'pending' || ride.driverId) {
      return res.status(400).json({ message: "Ride already accepted or not pending" });
    }

    // Fetch driver SSN from driver-service if not already SSN
    let driverSsn = driverId;
    if (!/^\d{3}-\d{2}-\d{4}$/.test(driverId)) {
      const driverServiceUrl = process.env.DRIVER_SERVICE_URL || 'http://localhost:3001/api/drivers';
      const driverRes = await axios.get(`${driverServiceUrl}/${driverId}`);
      driverSsn = driverRes.data._id;
    }

    // Prevent driver from accepting multiple rides at the same time
    const existingActiveRide = await Ride.findOne({
      driverId: driverSsn,
      status: { $in: ['accepted', 'in_progress'] }
    });
    if (existingActiveRide) {
      return res.status(400).json({ message: 'Driver already has an active ride.' });
    }

    // Fetch driver location from driver-service
    const driverServiceUrl = process.env.DRIVER_SERVICE_URL || 'http://localhost:3001/api/drivers';
    const driverRes = await axios.get(`${driverServiceUrl}/${driverSsn}`);
    const driver = driverRes.data;
    if (!driver.currentLocation || driver.currentLocation.latitude == null || driver.currentLocation.longitude == null) {
      return res.status(400).json({ message: "Driver location not available" });
    }

    // Calculate distance (Haversine formula)
    function toRad(x) { return x * Math.PI / 180; }
    const lat1 = ride.pickupLocation.latitude;
    const lon1 = ride.pickupLocation.longitude;
    const lat2 = driver.currentLocation.latitude;
    const lon2 = driver.currentLocation.longitude;
    const R = 3958.8; // Radius of Earth in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    if (distance > 10) {
      return res.status(400).json({ message: "Driver is not within 10 miles of pickup location" });
    }

    // Assign driver SSN and update status
    ride.driverId = driverSsn;
    ride.status = 'accepted';
    await ride.save();

    // Start simulating the ride in the background
    simulateRide(
      ride._id,
      ride.pickupLocation,
      ride.dropoffLocation
    );

    res.status(200).json({ message: "Ride accepted", ride });
  } catch (error) {
    next(error);
  }
};

updateRide = async (rideId, updateData) => {
  return await Ride.findByIdAndUpdate(rideId, updateData, { new: true });
};

exports.rideCompleted = async (req, res) => {
  try {
    // Fetch the latest ride from DB to ensure we have the correct SSN-based IDs
    const rideId = req.body._id || req.body.rideId || req.body.id;
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Ensure all required fields are present
    if (!ride.customerId || !ride.driverId || !ride.price || !ride.pickupLocation || !ride.dropoffLocation || !ride.dateTime) {
      return res.status(400).json({ 
        message: "Missing required ride data for billing",
        missing: {
          customerId: !ride.customerId,
          driverId: !ride.driverId,
          price: !ride.price,
          pickupLocation: !ride.pickupLocation,
          dropoffLocation: !ride.dropoffLocation,
          dateTime: !ride.dateTime
        }
      });
    }

    // Update ride status to completed
    ride.status = 'completed';
    await ride.save();

    // Prepare ride data for billing
    const rideData = {
      ...ride.toObject(),
      createdAt: ride.createdAt,
      updatedAt: new Date(), // Set completion time
      distanceCovered: ride.distanceCovered || 0
    };

    // Emit the event with complete ride data
    await emitCompletedRideEvent({ ride: rideData });
    
    return res.status(202).json({ 
      message: "Ride completed",
      ride: rideData
    });
  } catch (err) {
    console.error("Error completing ride:", err);
    return res.status(500).json({ 
      message: "Failed to complete ride", 
      error: err.message 
    });
  }
};



// // Starts ride for WS
exports.handleRideStart = async (req, res) => {
  const { rideId, start, end } = req.body;

  simulateRide(rideId, start, end); // Don't await — let it stream in background

  res.status(200).json({ message: "Ride simulation started" });
};




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

    // Fetch driver names for each ride
    const driverServiceUrl = process.env.DRIVER_SERVICE_URL || 'http://localhost:3001/api/drivers';
    const ridesWithDriverNames = await Promise.all(rides.map(async (ride) => {
      let driverName = 'N/A';
      if (ride.driverId) {
        try {
          const driverRes = await axios.get(`${driverServiceUrl}/${ride.driverId}`);
          driverName = driverRes.data.name || driverName;
        } catch (e) {
          // keep driverName as 'N/A'
        }
      }
      return {
        ...ride.toObject(),
        driverName,
      };
    }));

    res.json(ridesWithDriverNames);
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

// Add GET /api/rides/:rideId endpoint for polling ride status
exports.getRideById = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.uploadRideImages = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    ride.images = ride.images ? ride.images.concat(imagePaths) : imagePaths;
    if (req.body.description) {
      ride.issueDescription = req.body.description;
    }
    await ride.save();
    res.status(200).json({ message: 'Images uploaded', images: ride.images });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload images', error: error.message });
  }
};

exports.getRideImages = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    res.status(200).json({ images: ride.images || [] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch images', error: error.message });
  }
};
