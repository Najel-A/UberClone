const RideService = require('../services/RideService');
const LocationService = require('../services/LocationService');
// const PricingService = require('../services/PricingService'); // Comment out to fully bypass
const redisClient = require('../config/redis');

class RideController {
  static async createRide(req, res, next) {
    try {
      const rideData = req.body;

      // Validate required fields, Fix later
      // if (!rideData.customerId || !rideData.pickupLocation) {
      //   return res.status(400).json({ message: 'Missing required ride information' });
      // }

      // Check cache for nearby drivers
      const nearbyDriversCacheKey = `nearby_drivers:${rideData.pickupLocation.latitude}:${rideData.pickupLocation.longitude}`;
      let nearbyDrivers = await redisClient.get(nearbyDriversCacheKey);

      if (!nearbyDrivers) {
        console.log('Cache miss - fetching drivers from service');
      // Auto-assign nearest driver
        nearbyDrivers = await LocationService.findDriversWithinRadius(
        rideData.pickupLocation,
        10 // radius in miles
      );

        // Cache the driver responses for 60 seconds
        await redisClient.set(
          nearbyDriversCacheKey,
          JSON.stringify(nearbyDrivers),
          'EX',
          60
        );
        console.log('Cached drivers for 60 seconds');
      } else {
        console.log('Cache hit - using cached drivers');
        nearbyDrivers = JSON.parse(nearbyDrivers);
      }

      if (!nearbyDrivers || nearbyDrivers.length === 0) {
        return res.status(404).json({ message: 'No available drivers nearby' });
      }

      // Assign the closest available driver (assumes first is closest)
      rideData.driverId = nearbyDrivers[0].id;
      rideData.price = 25.50; // Mock price

      // Create the ride
      const ride = await RideService.createRide(rideData);

      // Emit event
      // await emitRideEvent('ride.created', ride);

      res.status(201).json(ride);
    } catch (error) {
      next(error);
    }
  }

  static async updateRide(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Ride ID is required' });
      }

      const updatedRide = await RideService.updateRide(id, updateData);

      if (!updatedRide) {
        return res.status(404).json({ message: 'Ride not found' });
      }

      // Emit ride updated event
      await emitRideEvent('ride.updated', updatedRide);

      res.json(updatedRide);
    } catch (error) {
      next(error);
    }
  }

  static async deleteRide(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'Ride ID is required' });
      }

      const deletedRide = await RideService.deleteRide(id);

      if (!deletedRide) {
        return res.status(404).json({ message: 'Ride not found' });
      }

      // Emit ride cancelled event
      //await emitRideEvent('ride.cancelled', deletedRide);

      res.json({ message: 'Ride deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerRides(req, res, next) {
    try {
      const { customerId } = req.params;

      if (!customerId) {
        return res.status(400).json({ message: 'Customer ID is required' });
      }

      const rides = await RideService.getRidesByCustomer(customerId);

      if (!rides || rides.length === 0) {
        return res.status(404).json({ message: 'No rides found for this customer' });
      }

      res.json(rides);
    } catch (error) {
      next(error);
    }
  }

  static async getDriverRides(req, res, next) {
    try {
      const { driverId } = req.params;

      if (!driverId) {
        return res.status(400).json({ message: 'Driver ID is required' });
      }

      const rides = await RideService.getRidesByDriver(driverId);

      if (!rides || rides.length === 0) {
        return res.status(404).json({ message: 'No rides found for this driver' });
      }

      res.json(rides);
    } catch (error) {
      next(error);
    }
  }

  static async getRideStatistics(req, res, next) {
    try {
      const { location } = req.query;

      if (!location) {
        return res.status(400).json({ message: 'Location query parameter is required' });
      }

      const stats = await RideService.getRideStatisticsByLocation(location);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  static async getNearbyDrivers(req, res, next) {
    try {
      const { latitude, longitude } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Both latitude and longitude are required' });
      }

      const customerLocation = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };

      const nearbyDrivers = await LocationService.findDriversWithinRadius(
        customerLocation,
        10 // 10 mile radius
      );

      res.json(nearbyDrivers);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RideController;