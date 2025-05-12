const Bill = require("../models/Bill");
const CustomerWallet = require("../models/CustomerWallet");
const DriverWallet = require("../models/DriverWallet");
const axios = require("axios");

exports.addToCustomerWallet = async (req, res, next) => {
  try {
    const { ssn, amount } = req.body;

    if (!ssn || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Invalid ssn or amount" });
    }

    const wallet = await CustomerWallet.findOne({ where: { ssn } });
    if (!wallet) {
      return res.status(404).json({ message: "Customer not found" });
    }

    wallet.wallet += amount;
    await wallet.save();

    res
      .status(200)
      .json({ message: "Wallet topped up", balance: wallet.wallet });
  } catch (err) {
    next(err);
  }
};

exports.withdrawFromDriverWallet = async (req, res, next) => {
  try {
    const { ssn, amount } = req.body;

    if (!ssn || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Invalid ssn or amount" });
    }

    const wallet = await DriverWallet.findOne({ where: { ssn } });
    if (!wallet) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (wallet.wallet < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    wallet.wallet -= amount;
    await wallet.save();

    res
      .status(200)
      .json({ message: "Amount withdrawn", balance: wallet.wallet });
  } catch (err) {
    next(err);
  }
};

exports.checkCustomerWallet = async (req, res, next) => {
  try {
    const { ssn, amount } = req.body;

    if (!ssn || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Invalid ssn or amount" });
    }

    const wallet = await CustomerWallet.findOne({ where: { ssn } });
    if (!wallet) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const canAfford = wallet.wallet >= amount;

    res.status(200).json({
      canAfford,
      balance: wallet.wallet,
      message: canAfford ? "Sufficient balance" : "Insufficient balance",
    });
  } catch (err) {
    next(err);
  }
};

exports.getCustomerWallet = async (req, res, next) => {
  try {
    const { ssn } = req.params;

    if (!ssn) {
      return res.status(400).json({ message: "SSN is required" });
    }

    const wallet = await CustomerWallet.findOne({ where: { ssn } });

    if (!wallet) {
      return res.status(404).json({ message: "Customer wallet not found" });
    }

    res.status(200).json({
      ssn: wallet.ssn,
      balance: wallet.wallet,
      message: "Wallet fetched successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.getDriverWallet = async (req, res, next) => {
  try {
    const { ssn } = req.params;

    if (!ssn) {
      return res.status(400).json({ message: "SSN is required" });
    }

    const wallet = await DriverWallet.findOne({ where: { ssn } });

    if (!wallet) {
      return res.status(404).json({ message: "Customer wallet not found" });
    }

    res.status(200).json({
      ssn: wallet.ssn,
      balance: wallet.wallet,
      message: "Wallet fetched successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.createCustomerWallet = async (req, res, next) => {
  try {
    const { ssn } = req.body;

    if (!ssn) {
      return res.status(400).json({ message: "SSN is required" });
    }

    // Check if wallet already exists
    const existingWallet = await CustomerWallet.findOne({ where: { ssn } });
    if (existingWallet) {
      return res
        .status(409)
        .json({ message: "Wallet already exists for this customer" });
    }

    // Create new wallet with default balance of 0
    const wallet = await CustomerWallet.create({
      ssn,
      wallet: 0,
    });

    res.status(201).json({
      message: "Customer wallet created successfully",
      wallet: {
        ssn: wallet.ssn,
        balance: wallet.wallet,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.createDriverWallet = async (req, res, next) => {
  try {
    const { ssn } = req.body;
    console.log("Received request to create driver wallet for SSN:", ssn);

    if (!ssn) {
      console.log("SSN is missing in request");
      return res.status(400).json({ message: "SSN is required" });
    }

    // Check if wallet already exists
    const existingWallet = await DriverWallet.findOne({ where: { ssn } });
    if (existingWallet) {
      console.log("Wallet already exists for SSN:", ssn);
      return res
        .status(409)
        .json({ message: "Wallet already exists for this driver" });
    }

    console.log("Creating new wallet for SSN:", ssn);
    // Create new wallet with default balance of 0
    const wallet = await DriverWallet.create({
      ssn,
      wallet: 0,
    });

    console.log("Wallet created successfully:", wallet);
    res.status(201).json({
      message: "Driver wallet created successfully",
      wallet: {
        ssn: wallet.ssn,
        balance: wallet.wallet,
      },
    });
  } catch (err) {
    console.error("Error in createDriverWallet:", err);
    next(err);
  }
};

exports.getAllBills = async (req, res, next) => {
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

    // Build the where clause based on provided parameters
    const where = {};

    if (billId) where.billId = billId;
    if (customerId) where.customerId = customerId;
    if (driverId) where.driverId = driverId;
    if (status) where.status = status;

    // Handle amount range
    if (minAmount || maxAmount) {
      where.totalAmount = {};
      if (minAmount) where.totalAmount.$gte = parseFloat(minAmount);
      if (maxAmount) where.totalAmount.$lte = parseFloat(maxAmount);
    }

    // Handle date range
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.$gte = new Date(startDate);
      if (endDate) where.date.$lte = new Date(endDate);
    }

    // Execute the query
    const bills = await Bill.findAll({
      where,
      order: [["date", "DESC"]], // Sort by most recent first
    });

    if (!bills || bills.length === 0) {
      return res.status(200).json([]); // Return empty array instead of 404
    }

    // Get customer and driver details for each bill
    const formattedBills = await Promise.all(
      bills.map(async (bill) => {
        let customerDetails = null;
        let driverDetails = null;

        try {
          // Get customer details
          if (bill.customerId) {
            const customerResponse = await axios.get(
              `http://customer-service:3002/api/customers/${bill.customerId}`
            );
            customerDetails = customerResponse.data;
          }

          // Get driver details
          if (bill.driverId) {
            const driverResponse = await axios.get(
              `http://driver-service:3003/api/drivers/${bill.driverId}`
            );
            driverDetails = driverResponse.data;
          }
        } catch (error) {
          console.error("Error fetching user details:", error.message);
          // Continue even if user details can't be fetched
        }

        return {
          billId: bill.billId,
          customerId: bill.customerId,
          customerName: customerDetails
            ? `${customerDetails.firstName} ${customerDetails.lastName}`
            : "N/A",
          driverId: bill.driverId,
          driverName: driverDetails
            ? `${driverDetails.firstName} ${driverDetails.lastName}`
            : "N/A",
          amount: bill.totalAmount,
          status: bill.status,
          pickupLocation: bill.pickupLocation,
          dropoffLocation: bill.dropoffLocation,
          distanceCovered: bill.distanceCovered,
          date: bill.date,
          pickupTime: bill.pickupTime,
          dropoffTime: bill.dropoffTime,
          createdAt: bill.createdAt,
          updatedAt: bill.updatedAt,
        };
      })
    );

    res.status(200).json(formattedBills);
  } catch (err) {
    console.error("Error in getAllBills:", err);
    next(err);
  }
};

exports.getBillById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findByPk(id, {
      where: { billId: id },
    });

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    let customerDetails = null;
    let driverDetails = null;

    try {
      // Get customer details
      if (bill.customerId) {
        const customerResponse = await axios.get(
          `http://customer-service:3002/api/customers/${bill.customerId}`
        );
        customerDetails = customerResponse.data;
      }

      // Get driver details
      if (bill.driverId) {
        const driverResponse = await axios.get(
          `http://driver-service:3003/api/drivers/${bill.driverId}`
        );
        driverDetails = driverResponse.data;
      }
    } catch (error) {
      console.error("Error fetching user details:", error.message);
      // Continue even if user details can't be fetched
    }

    // Format the response
    const formattedBill = {
      billId: bill.billId,
      customerId: bill.customerId,
      customerName: customerDetails
        ? `${customerDetails.firstName} ${customerDetails.lastName}`
        : "N/A",
      driverId: bill.driverId,
      driverName: driverDetails
        ? `${driverDetails.firstName} ${driverDetails.lastName}`
        : "N/A",
      amount: bill.totalAmount,
      status: bill.status,
      pickupLocation: bill.pickupLocation,
      dropoffLocation: bill.dropoffLocation,
      distanceCovered: bill.distanceCovered,
      date: bill.date,
      pickupTime: bill.pickupTime,
      dropoffTime: bill.dropoffTime,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
    };

    res.status(200).json(formattedBill);
  } catch (err) {
    console.error("Error in getBillById:", err);
    next(err);
  }
};
