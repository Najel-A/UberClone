const path = require('path');
const fs = require('fs');
const jwt = require("jsonwebtoken");
const Customer = require('../models/customerModel');
const billingService = require('../services/billingService');
const { hashPassword, comparePassword } = require("../utils/passwordHash");

// Create a new customer
exports.createCustomer = async (req, res) => {
  try {
    const { _id, email, password, ...rest } = req.body;

    // Check if customer already exists
    const existing = await Customer.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Customer already exists' });

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create and save the customer
    const customer = new Customer({ _id, email, password: hashedPassword, ...rest });
    await customer.save();

    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

// Login Customer
exports.loginCustomer = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      let user = await Customer.findOne({ email });
  
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
  
      req.session.user = { id: user._id, name: user.firstName, email: user.email};  // Store user details in session
      console.log(req.session.user);
  
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, name: user.firstName, email: user.email,},
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      console.log(token);
      res.json({ message: "Login successful", id: user._id, token, name: user.firstName });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error logging in" });
    }
};


// Delete Customer Account  
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

exports.getAllCustomers = async (_, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};


// Generate Bill
exports.generateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const rideData = req.body;

    const customer = await Customer.findById(id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const bill = billingService.generateBill(customer, rideData);
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};


// Find Nearby Drivers
exports.findNearbyDrivers = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) return res.status(400).json({ message: 'Missing coordinates' });

    // Replace with actual geolocation API or DB query
    const drivers = [{ id: 'd1', name: 'John Doe', distance: 5.2 }];
    res.status(200).json(drivers);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};


// Upload Images
exports.uploadImages = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) return res.status(400).json({ message: 'No images provided' });

    // Save logic here...
    res.status(200).json({ message: 'Images uploaded successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

// Customer Logout
exports.logoutCustomer = (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logout successful" });
    });
  };