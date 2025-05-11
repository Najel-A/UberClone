const Bill = require('../models/Bill'); // Import the Bill model
const CustomerWallet = require('../models/CustomerWallet'); 
const DriverWallet = require('../models/DriverWallet');
exports.addToCustomerWallet = async (req, res, next) => {
  try {
    const { ssn, amount } = req.body;

    if (!ssn || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Invalid ssn or amount' });
    }

    const wallet = await CustomerWallet.findOne({ where: { ssn } });
    if (!wallet) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    wallet.wallet += amount;
    await wallet.save();

    res.status(200).json({ message: 'Wallet topped up', balance: wallet.wallet });
  } catch (err) {
    next(err);
  }
};
exports.withdrawFromDriverWallet = async (req, res, next) => {
  try {
    const { ssn, amount } = req.body;

    if (!ssn || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Invalid ssn or amount' });
    }

    const wallet = await DriverWallet.findOne({ where: { ssn } });
    if (!wallet) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    if (wallet.wallet < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    wallet.wallet -= amount;
    await wallet.save();

    res.status(200).json({ message: 'Amount withdrawn', balance: wallet.wallet });
  } catch (err) {
    next(err);
  }
};

exports.checkCustomerWallet = async (req, res, next) => {
  try {
    const { ssn, amount } = req.body;

    if (!ssn || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Invalid ssn or amount' });
    }

    const wallet = await CustomerWallet.findOne({ where: { ssn } });
    if (!wallet) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const canAfford = wallet.wallet >= amount;

    res.status(200).json({
      canAfford,
      balance: wallet.wallet,
      message: canAfford ? 'Sufficient balance' : 'Insufficient balance'
    });
  } catch (err) {
    next(err);
  }
};

