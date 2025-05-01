const path = require('path');
const fs = require('fs');
const jwt = require("jsonwebtoken");
const axios = require('axios');
const Admin = require('../models/adminModel');
const { hashPassword, comparePassword } = require("../utils/passwordHash");

// Create a new Admin
exports.createAdmin = async (req, res) => {
  try {
    const { _id, email, password, ...rest } = req.body;

    // Check if customer already exists
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Customer already exists' });

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create and save the admin
    const admin = new Admin({ _id, email, password: hashedPassword, ...rest });
    await admin.save();

    res.status(201).json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

// Login Admin
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      let user = await Admin.findOne({ email });
  
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
      res.json({ message: "Login successful", id: user._id, token, name: user.name });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error logging in" });
    }
};

// Add Driver
exports.addDriver = async (req, res) => {
  try {
    const driverData = req.body;

    // Send the driver data to the driver-service signup endpoint
    const driverServiceUrl = 'http://localhost:3001/api/drivers/signup';
    const response = await axios.post(driverServiceUrl, driverData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Return the response from the driver-service
    res.status(201).json(response.data);
  } catch (err) {
    console.error('Error adding driver:', err.message);

    // Handle errors from the driver-service
    if (err.response) {
      return res.status(err.response.status).json({
        message: err.response.data.message || 'Error from driver-service',
        error: err.response.data.error || err.message,
      });
    }

    // Handle internal server errors
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

// Add Customer
exports.addCustomer = async (req, res) => {
  try {
    const customerData = req.body;

    // Send the driver data to the customer-service signup endpoint
    const customerServiceUrl = 'http://localhost:3000/api/customers';
    const response = await axios.post(customerServiceUrl, customerData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Return the response from the driver-service
    res.status(201).json(response.data);
  } catch (err) {
    console.error('Error adding customer:', err.message);

    // Handle errors from the customer-service
    if (err.response) {
      return res.status(err.response.status).json({
        message: err.response.data.message || 'Error from customer-service',
        error: err.response.data.error || err.message,
      });
    }

    // Handle internal server errors
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

// Get Statistics
// exports.getStatistics = async (req, res) => {
//   try {
//     const { date, area } = req.query;
//     if (!date || !area) {
//       return res.status(400).json({ message: 'Date and area parameters are required' });
//     }

//     // Example aggregation - adjust based on your schema
//     const stats = await Bill.aggregate([
//       { 
//         $match: { 
//           date: new Date(date),
//           'pickupLocation.area': area 
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           totalRevenue: { $sum: "$totalAmount" },
//           totalRides: { $sum: 1 }
//         }
//       }
//     ]);

//     res.status(200).json(stats[0] || { totalRevenue: 0, totalRides: 0 });
//   } catch (err) {
//     res.status(500).json({ message: 'Internal server error', error: err.message });
//   }
// };

// Get Graphs/Charts Data
// exports.getGraphData = async (req, res) => {
//   try {
//     const { type } = req.query;
//     const validTypes = ['area', 'driver', 'customer'];
    
//     if (!validTypes.includes(type)) {
//       return res.status(400).json({ 
//         message: 'Invalid graph type', 
//         validTypes 
//       });
//     }

//     // Example data aggregation
//     const data = await Bill.aggregate([
//       {
//         $group: {
//           _id: `$${type}Id`,
//           count: { $sum: 1 },
//           totalAmount: { $sum: "$totalAmount" }
//         }
//       },
//       { $limit: 10 }
//     ]);

//     res.status(200).json(data);
//   } catch (err) {
//     res.status(500).json({ message: 'Internal server error', error: err.message });
//   }
// };

// Search Bills
// exports.searchBills = async (req, res) => {
//   try {
//     const { customerId, driverId, rideId, date } = req.query;
//     const query = {};
    
//     if (customerId) query.customerId = customerId;
//     if (driverId) query.driverId = driverId;
//     if (rideId) query.rideId = rideId;
//     if (date) query.date = new Date(date);

//     const bills = await Bill.find(query);
    
//     if (bills.length === 0) {
//       return res.status(404).json({ message: 'No bills found' });
//     }
//     res.status(200).json(bills);
//   } catch (err) {
//     res.status(500).json({ message: 'Internal server error', error: err.message });
//   }
// };

// Get Bill by ID
// exports.getBill = async (req, res) => {
//   try {
//     const bill = await Bill.findById(req.params.id);
//     if (!bill) {
//       return res.status(404).json({ message: 'Bill not found' });
//     }
//     res.status(200).json(bill);
//   } catch (err) {
//     res.status(500).json({ message: 'Internal server error', error: err.message });
//   }
// };

// Admin Logout
exports.logoutAdmin = (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logout successful" });
    });
};