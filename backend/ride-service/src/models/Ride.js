const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
//   _id: { type: String, required: true }, // MongoDB will generate this
  pickupLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  dropoffLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  dateTime: { type: Date, required: true },
  customerId: { type: String, required: true },
  driverId: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);
