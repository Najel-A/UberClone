const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
//   _id: { type: String, required: true }, // MongoDB will generate this
  pickupLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true }
  },
  // Needed for MongoDB querying
  pickupPoint: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
    
  },
  dropoffLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true }
  },
  dateTime: { type: Date, required: true },
  customerId: { type: String, required: true },
  driverId: { type: String, required: false },
  price: {type: Number, required: true}
}, { timestamps: true });

rideSchema.index({ pickupPoint: '2dsphere' }); // For MongoDB 

module.exports = mongoose.model('Ride', rideSchema);
