const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const Admin = require("../models/adminModel");
const { hashPassword, comparePassword } = require("../utils/passwordHash");

// Create a new Admin
exports.createAdmin = async (req, res) => {
  try {
    const { _id, email, password, ...rest } = req.body;

    // Check if customer already exists
    const existing = await Admin.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Customer already exists" });

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create and save the admin
    const admin = new Admin({ _id, email, password: hashedPassword, ...rest });
    await admin.save();

    res.status(201).json(admin);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Login Admin
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await Admin.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    req.session.user = {
      id: user._id,
      name: user.firstName,
      email: user.email,
    }; // Store user details in session
    console.log(req.session.user);

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, name: user.firstName, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log(token);
    res.json({
      message: "Login successful",
      id: user._id,
      token,
      name: user.name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
};

// Update admin details
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id, email, password, ...rest } = req.body;

    // Prevent updating `_id`
    if (_id) {
      return res.status(400).json({ message: "Updating '_id' is not allowed" });
    }

    const updateData = { ...rest };

    // If a new email is provided, validate and add it to the update
    if (email) {
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin && existingAdmin._id.toString() !== id) {
        return res.status(409).json({ message: "Email is already in use" });
      }
      updateData.email = email;
    }

    // If a new password is provided, hash it before updating
    if (password) {
      const hashedPassword = await hashPassword(password);
      updateData.password = hashedPassword;
    }

    // Update the admin
    const admin = await Admin.findByIdAndUpdate(id, updateData, { new: true });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  } catch (err) {
    console.error("Error updating admin:", err.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Add Driver
exports.addDriver = async (req, res) => {
  try {
    const driverData = req.body;

    // Send the driver data to the driver-service signup endpoint
    const driverServiceUrl = "http://driver-service:3003/api/drivers/signup";
    const response = await axios.post(driverServiceUrl, driverData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Return the response from the driver-service
    res.status(201).json(response.data);
  } catch (err) {
    console.error("Error adding driver:", err.message);

    // Handle errors from the driver-service
    if (err.response) {
      return res.status(err.response.status).json({
        message: err.response.data.message || "Error from driver-service",
        error: err.response.data.error || err.message,
      });
    }

    // Handle internal server errors
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Add Customer
exports.addCustomer = async (req, res) => {
  try {
    const customerData = req.body;

    // Send the driver data to the customer-service signup endpoint
    const customerServiceUrl = "http://customer-service:3002/api/customers";
    const response = await axios.post(customerServiceUrl, customerData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Return the response from the driver-service
    res.status(201).json(response.data);
  } catch (err) {
    console.error("Error adding customer:", err.message);

    // Handle errors from the customer-service
    if (err.response) {
      return res.status(err.response.status).json({
        message: err.response.data.message || "Error from customer-service",
        error: err.response.data.error || err.message,
      });
    }

    // Handle internal server errors
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
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

// Delete Customer by ID
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Send delete request to customer-service
    const customerServiceUrl = `http://customer-service:3002/api/customers/${id}`;
    const response = await axios.delete(customerServiceUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Return the response from the customer-service
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error deleting customer:", err.message);

    // Handle errors from the customer-service
    if (err.response) {
      return res.status(err.response.status).json({
        message: err.response.data.message || "Error from customer-service",
        error: err.response.data.error || err.message,
      });
    }

    // Handle internal server errors
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Delete Driver by ID
exports.deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    // Send delete request to driver-service
    const driverServiceUrl = `http://driver-service:3003/api/drivers/${id}`;
    const response = await axios.delete(driverServiceUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Return the response from the driver-service
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error deleting driver:", err.message);

    // Handle errors from the driver-service
    if (err.response) {
      return res.status(err.response.status).json({
        message: err.response.data.message || "Error from driver-service",
        error: err.response.data.error || err.message,
      });
    }

    // Handle internal server errors
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Get All Customers
exports.getAllCustomers = async (req, res) => {
  try {
    // Send request to customer-service to get all customers
    const customerServiceUrl = "http://customer-service:3002/api/customers";
    const response = await axios.get(customerServiceUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Return the response from the customer-service
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error getting customers:", err.message);

    // Handle errors from the customer-service
    if (err.response) {
      return res.status(err.response.status).json({
        message: err.response.data.message || "Error from customer-service",
        error: err.response.data.error || err.message,
      });
    }

    // Handle internal server errors
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Get All Drivers
exports.getAllDrivers = async (req, res) => {
  try {
    console.log("Getting all drivers");
    // Get query parameters from the request
    const queryParams = req.query;

    // Send request to driver-service to get all drivers
    const driverServiceUrl = "http://driver-service:3003/api/drivers";
    const response = await axios.get(driverServiceUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      params: queryParams, // Forward any query parameters to the driver service
    });

    // Return the response from the driver-service
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error getting drivers:", err.message);

    // Handle errors from the driver-service
    if (err.response) {
      return res.status(err.response.status).json({
        message: err.response.data.message || "Error from driver-service",
        error: err.response.data.error || err.message,
      });
    }

    // Handle internal server errors
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Get Customer by Email
exports.getCustomerByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Send request to customer-service to get customer by email
    const customerServiceUrl = `http://customer-service:3002/api/customers/email/${email}`;
    const response = await axios.get(customerServiceUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Return the response from the customer-service
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error getting customer by email:", err.message);

    // Handle errors from the customer-service
    if (err.response) {
      return res.status(err.response.status).json({
        message: err.response.data.message || "Error from customer-service",
        error: err.response.data.error || err.message,
      });
    }

    // Handle internal server errors
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Get Driver by Email
exports.getDriverByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Send request to driver-service to get driver by email
    const driverServiceUrl = `http://driver-service:3003/api/drivers/email/${email}`;
    const response = await axios.get(driverServiceUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Return the response from the driver-service
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error getting driver by email:", err.message);

    // Handle errors from the driver-service
    if (err.response) {
      return res.status(err.response.status).json({
        message: err.response.data.message || "Error from driver-service",
        error: err.response.data.error || err.message,
      });
    }

    // Handle internal server errors
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Update Driver
exports.updateDriver = async (req, res) => {
  try {
    console.log("Updating driver");
    const { id } = req.params;
    const driverData = req.body;

    // Send update request to driver-service
    const driverServiceUrl = `http://driver-service:3003/api/drivers/${id}`;
    const response = await axios.put(driverServiceUrl, driverData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Return the response from the driver-service
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error updating driver:", err.message);

    // Handle errors from the driver-service
    if (err.response) {
      return res.status(err.response.status).json({
        message: err.response.data.message || "Error from driver-service",
        error: err.response.data.error || err.message,
      });
    }

    // Handle internal server errors
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Update Customer
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customerData = req.body;

    // Send update request to customer-service
    const customerServiceUrl = `http://customer-service:3002/api/customers/${id}`;
    const response = await axios.put(customerServiceUrl, customerData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Return the response from the customer-service
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error updating customer:", err.message);

    // Handle errors from the customer-service
    if (err.response) {
      return res.status(err.response.status).json({
        message: err.response.data.message || "Error from customer-service",
        error: err.response.data.error || err.message,
      });
    }

    // Handle internal server errors
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Get All Bills with Search
exports.getAllBills = async (req, res) => {
  try {
    const {
      billId,
      customerId,
      driverId,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      status,
    } = req.query;

    // Build query parameters for billing service
    const queryParams = new URLSearchParams();
    if (billId) queryParams.append("billId", billId);
    if (customerId) queryParams.append("customerId", customerId);
    if (driverId) queryParams.append("driverId", driverId);
    if (minAmount) queryParams.append("minAmount", minAmount);
    if (maxAmount) queryParams.append("maxAmount", maxAmount);
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (status) queryParams.append("status", status);

    // Send request to billing-service to get all bills
    const billingServiceUrl = `http://billing-service:3001/api/bills${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await axios.get(billingServiceUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Return the response from the billing-service
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error getting bills:", err.message);

    // Handle errors from the billing-service
    if (err.response) {
      return res.status(err.response.status).json({
        message: err.response.data.message || "Error from billing-service",
        error: err.response.data.error || err.message,
      });
    }

    // Handle internal server errors
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Get Bill by ID
exports.getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    // Send request to billing-service to get bill by ID
    const billingServiceUrl = `http://billing-service:3004/api/bills/${id}`;
    const response = await axios.get(billingServiceUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Return the response from the billing-service
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error getting bill:", err.message);

    // Handle errors from the billing-service
    if (err.response) {
      return res.status(err.response.status).json({
        message: err.response.data.message || "Error from billing-service",
        error: err.response.data.error || err.message,
      });
    }

    // Handle internal server errors
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};
