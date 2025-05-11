const Driver = require("../models/driverModel");
const { NotFoundError, ConflictError } = require("../utils/errors");
const { hashPassword, comparePassword } = require("../utils/passwordHash");
const jwt = require("jsonwebtoken");

// Create Driver
exports.createDriver = async (req, res) => {
  try {
    const driverData = req.body;

    // Check for existing driver
    const existingDriver = await Driver.findOne({
      $or: [{ _id: driverData._id }, { email: driverData.email }],
    });

    if (existingDriver) {
      throw new ConflictError("Driver ID or email already exists");
    }
    // Hash password
    driverData.password = await hashPassword(driverData.password);

    const driver = await Driver.create(driverData);
    res.status(201).json(driver);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }
    if (err instanceof ConflictError) {
      return res.status(409).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login Driver
exports.loginDriver = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await Driver.findOne({ email });

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
      name: user.firstName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
};

// Get Driver by ID
exports.getDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      throw new NotFoundError("Driver not found");
    }
    console.log('Driver document returned:', driver);
    if (!driver.currentLocation) {
      driver.currentLocation = { latitude: null, longitude: null };
    }
    res.status(200).json(driver);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update driver details
exports.updateDriver = async (req, res) => {
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
      const existingDriver = await Driver.findOne({ email });
      if (existingDriver && existingDriver._id.toString() !== id) {
        return res.status(409).json({ message: "Email is already in use" });
      }
      updateData.email = email;
    }

    // If a new password is provided, hash it before updating
    if (password) {
      const hashedPassword = await hashPassword(password);
      updateData.password = hashedPassword;
    }

    // Update the driver
    const driver = await Driver.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.json(driver);
  } catch (err) {
    console.error("Error updating driver:", err.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Delete Driver
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      throw new NotFoundError("Driver not found");
    }
    res.status(200).json({ message: "Driver deleted successfully" });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// List Drivers with Filters
exports.listDrivers = async (req, res) => {
  try {
    const query = {};

    // Search by name
    if (req.query.firstName) {
      query.firstName = { $regex: req.query.firstName, $options: "i" };
    }
    if (req.query.lastName) {
      query.lastName = { $regex: req.query.lastName, $options: "i" };
    }

    // Search by address fields
    if (req.query.city) {
      query["address.city"] = { $regex: req.query.city, $options: "i" };
    }
    if (req.query.state) {
      query["address.state"] = { $regex: req.query.state, $options: "i" };
    }
    if (req.query.zipCode) {
      query["address.zipCode"] = req.query.zipCode;
    }

    // Search by phone number
    if (req.query.phoneNumber) {
      query.phoneNumber = req.query.phoneNumber;
    }

    // Search by email
    if (req.query.email) {
      query.email = { $regex: req.query.email, $options: "i" };
    }

    // Search by car make/model/year
    if (req.query.carMake) {
      query["carDetails.make"] = { $regex: req.query.carMake, $options: "i" };
    }
    if (req.query.carModel) {
      query["carDetails.model"] = { $regex: req.query.carModel, $options: "i" };
    }
    if (req.query.carYear) {
      query["carDetails.year"] = parseInt(req.query.carYear);
    }

    // Search by minimum rating
    if (req.query.minRating) {
      query.rating = { $gte: parseFloat(req.query.minRating) };
    }

    const drivers = await Driver.find(query);
    res.status(200).json(drivers);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Driver Video
exports.getDriverVideo = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id, {
      introductionMedia: 1,
    });

    if (!driver || !driver.introductionMedia?.video) {
      throw new NotFoundError("Driver video not found");
    }

    res.status(200).json({
      videoUrl: driver.introductionMedia.video,
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Driver Logout
exports.logoutDriver = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    res.json({ message: "Logout successful" });
  });
};

// Update Driver Status and Location
exports.updateDriverStatusAndLocation = async (req, res) => {
  try {
    const { id } = req.params; // driver's _id (SSN in your case)
    const { status, currentLocation } = req.body;

    // Validate status and location fields (optional but recommended)
    const updateFields = {};
    if (status) {
      if (!["available", "unavailable"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      updateFields.status = status;
    }

    if (currentLocation) {
      const { latitude, longitude } = currentLocation;
      if (
        typeof latitude !== "number" ||
        latitude < -90 ||
        latitude > 90 ||
        typeof longitude !== "number" ||
        longitude < -180 ||
        longitude > 180
      ) {
        return res
          .status(400)
          .json({ message: "Invalid latitude or longitude" });
      }
      updateFields.currentLocation = { latitude, longitude };
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.json(updatedDriver);
  } catch (err) {
    console.error("Error updating driver:", err.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Get Driver by Email
exports.getDriverByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const driver = await Driver.findOne({ email });

    if (!driver) {
      throw new NotFoundError("Driver not found");
    }

    res.status(200).json(driver);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
