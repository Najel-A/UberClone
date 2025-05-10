const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  _id: { 
    type: String, 
    required: true,
    match: [/^\d{3}-\d{2}-\d{4}$/, 'Please enter a valid SSN in format XXX-XX-XXXX'],
    unique: true 
  },  
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  creditCardDetails: {
    cardNumber: { type: String, required: true },
    expiryDate: { type: String, required: true },
  },
  ridesHistory: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviews: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
