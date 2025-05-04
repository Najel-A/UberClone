const RideService = require('../services/RideService');
const LocationService = require('../services/LocationService');
const PricingService = require('../services/PricingService');

class RideController {
  static async createRide(req, res, next) {
    try {
      const rideData = req.body;

      // Validate required fields, Fix later
      // if (!rideData.customerId || !rideData.pickupLocation) {
      //   return res.status(400).json({ message: 'Missing required ride information' });
      // }

      // Auto-assign nearest driver
      const nearbyDrivers = await LocationService.findDriversWithinRadius(
        rideData.pickupLocation,
        10 // radius in miles
      );

      if (!nearbyDrivers || nearbyDrivers.length === 0) {
        return res.status(404).json({ message: 'No available drivers nearby' });
      }

      // Assign the closest available driver (assumes first is closest)
      rideData.driverId = nearbyDrivers[0].id;

      // Calculate price
      const price = await PricingService.calculateRidePrice(rideData);
      rideData.price = price;
      console.log('Assigned Driver:', rideData.driverId);
      console.log('Calculated Price:', price);


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