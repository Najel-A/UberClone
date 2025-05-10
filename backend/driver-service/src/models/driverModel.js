const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  _id: { 
    type: String, 
    required: true,
    match: [/^\d{3}-\d{2}-\d{4}$/, 'Please enter a valid SSN in format XXX-XX-XXXX'],
    unique: true 
  },  
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  address: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, length: 2 },
    zipCode: { type: String, required: true, validate: /^\d{5}(-\d{4})?$/ }
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^\+1\d{10}$/.test(v),
      message: 'Phone must be +1 followed by 10 digits'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Invalid email format'
    }
  },
  password: { type: String, required: true },
  carDetails: {
    make: { type: String, required: true},
    model: { type: String, required: true },
    year: { 
      type: Number, 
      required: true,
      min: 1970,
      max: new Date().getFullYear() + 1
    }
  },
  currentLocation: {
    latitude: { 
      type: Number, 
      required: false, 
      min: -90, 
      max: 90, 
      validate: {
        validator: (v) => !isNaN(v),
        message: 'Latitude must be a valid number between -90 and 90'
      }
    },
    longitude: { 
      type: Number, 
      required: false, 
      min: -180, 
      max: 180, 
      validate: {
        validator: (v) => !isNaN(v),
        message: 'Longitude must be a valid number between -180 and 180'
      }
    }
  },
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 1.0,
    max: 5.0,
    set: v => parseFloat(v.toFixed(1)) // Store with 1 decimal place
  },
  reviews: [{
    type: String,
    maxlength: 500
  }],
  introductionMedia: {
    images: [{
      type: String,
      validate: {
        validator: (v) => v.startsWith('https://'),
        message: 'Image must be a valid URL'
      }
    }],
    video: {
      type: String,
      validate: {
        validator: (v) => v.startsWith('https://'),
        message: 'Video must be a valid URL'
      }
    }
  },
  ridesHistory: [{
    type: String,
    ref: 'Ride'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
driverSchema.index({ 'currentLocation.latitude': 1, 'currentLocation.longitude': 1 });

module.exports = mongoose.model('Driver', driverSchema);