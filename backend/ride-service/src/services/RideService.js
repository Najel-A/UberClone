const Ride = require('../models/Ride');

class RideService {
  static async createRide(rideData) {
    const ride = new Ride(rideData);
    return await ride.save();
  }

  static async updateRide(id, updateData) {
    return await Ride.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async deleteRide(id) {
    return await Ride.findByIdAndDelete(id);
  }

  static async getRidesByCustomer(customerId) {
    return await Ride.find({ customerId });
  }

  static async getRidesByDriver(driverId) {
    return await Ride.find({ driverId });
  }

  static async getRideStatisticsByLocation(location) {
    // Implement aggregation logic here
    return await Ride.aggregate([
      { $match: { 'pickupLocation.area': location } },
      // Add more aggregation stages as needed
    ]);
  }
}

module.exports = RideService;