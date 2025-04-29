const Driver = require('../models/driverModel');
const { NotFoundError, ConflictError } = require('../utils/errors');

// Create Driver
exports.createDriver = async (req, res) => {
  try {
    const driverData = req.body;
    
    // Check for existing driver
    const existingDriver = await Driver.findOne({ 
      $or: [
        { _id: driverData._id },
        { email: driverData.email }
      ]
    });
    
    if (existingDriver) {
      throw new ConflictError('Driver ID or email already exists');
    }

    const driver = await Driver.create(driverData);
    res.status(201).json(driver);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    if (err instanceof ConflictError) {
      return res.status(409).json({ message: err.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login Driver
exports.loginDriver = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      let user = await Driver.findOne({ email });
  
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


// Get Driver by ID
exports.getDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      throw new NotFoundError('Driver not found');
    }
    res.status(200).json(driver);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Driver
exports.updateDriver = async (req, res) => {
  try {
    const updates = req.body;
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!driver) {
      throw new NotFoundError('Driver not found');
    }
    res.status(200).json(driver);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ message: err.message });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete Driver
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      throw new NotFoundError('Driver not found');
    }
    res.status(200).json({ message: 'Driver deleted successfully' });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// List Drivers (with search)
exports.listDrivers = async (req, res) => {
  try {
    const query = {};
    
    // Search by attributes
    if (req.query.firstName) {
      query.firstName = { $regex: req.query.firstName, $options: 'i' };
    }
    if (req.query.lastName) {
      query.lastName = { $regex: req.query.lastName, $options: 'i' };
    }
    if (req.query.city) {
      query['address.city'] = { $regex: req.query.city, $options: 'i' };
    }

    const drivers = await Driver.find(query);
    res.status(200).json(drivers);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Driver Video
exports.getDriverVideo = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id, 
      { introductionMedia: 1 });
    
    if (!driver || !driver.introductionMedia?.video) {
      throw new NotFoundError('Driver video not found');
    }
    
    res.status(200).json({ 
      videoUrl: driver.introductionMedia.video 
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'Internal server error' });
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