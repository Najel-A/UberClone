const Bill = require('../models/Bill'); // Import the Bill model

// Create a new Bill for each ride
exports.createBill = async (req, res) => {
  try {
    const billData = req.body;

    // Create a new Bill
    const newBill = await Bill.create(billData);

    res.status(201).json({
      message: 'Bill created successfully',
      bill: newBill,
    });
  } catch (err) {
    console.error('Error creating bill:', err.message);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

// Delete an existing Bill
exports.deleteBill = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the Bill
    const deletedBill = await Bill.destroy({ where: { _id: id } });

    if (!deletedBill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.status(200).json({ message: 'Bill deleted successfully' });
  } catch (err) {
    console.error('Error deleting bill:', err.message);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

// Search an existing Bill
exports.searchBill = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the Bill by ID
    const bill = await Bill.findByPk(id);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.status(200).json(bill);
  } catch (err) {
    console.error('Error searching bill:', err.message);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};