const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^BILL-\d{8}$/.test(v),
      message: 'Bill ID must follow BILL-12345678 format'
    }
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    validate: {
      validator: (v) => v <= new Date(),
      message: 'Date cannot be in the future'
    }
  },
  pickupTime: {
    type: Date,
    required: true
  },
  dropoffTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > this.pickupTime;
      },
      message: 'Dropoff must be after pickup'
    }
  },
  distanceCovered: {
    type: Number,
    required: true,
    min: 0.1,
    max: 1000 // 1000 miles/km max
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 1.00 // Minimum $1 fare
  },
  sourceLocation: {
    type: String,
    required: true,
    trim: true
  },
  destinationLocation: {
    type: String,
    required: true,
    trim: true
  },
  driverId: {
    type: String,
    required: true,
    ref: 'Driver'
  },
  customerId: {
    type: String,
    required: true,
    ref: 'Customer'
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'disputed', 'refunded'],
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Virtual for ride duration (in minutes)
billSchema.virtual('durationMinutes').get(function() {
  return (this.dropoffTime - this.pickupTime) / (1000 * 60);
});

// Indexes for optimized queries
billSchema.index({ driverId: 1, date: 1 });
billSchema.index({ customerId: 1, date: 1 });
billSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Bill', billSchema);