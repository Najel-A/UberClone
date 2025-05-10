const Ride = require('../models/Ride');

exports.createRide = async (rideData) => {
  const ride = new Ride(rideData);
  return await ride.save();
};

// Used only for ride assignment
exports.assignRide = async (rideId, driverId) => {
  try {
    const objectId = mongoose.Types.ObjectId(rideId);

    const result = await Ride.updateOne(
      { _id: objectId, driverId: null }, // Only update if ride is unclaimed
      { $set: { driverId: driverId } }
    );

    if (result.modifiedCount === 1) {
      return { success: true };
    } else {
      return { success: false, message: "Another driver has accepted the ride or ride does not exist" };
    }
  } catch (error) {
    throw new Error("Invalid ride ID format");
  }
};

// Used for ride updates during ride
exports.updateRide = async (id, updateData) => {
  return await Ride.findByIdAndUpdate(id, updateData, { new: true });
};

exports.deleteRide = async (id) => {
  return await Ride.findByIdAndDelete(id);
};

exports.getRidesByCustomer = async (customerId) => {
  return await Ride.find({ customerId });
};

exports.getRidesByDriver = async (driverId) => {
  return await Ride.find({ driverId });
};

exports.getRideStatisticsByLocation = async (location) => {
  return await Ride.aggregate([
    { $match: { 'pickupLocation.area': location } },
    // Add more aggregation stages as needed
  ]);
};
