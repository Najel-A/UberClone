const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

router.post('/addToCustomerWallet', billController.addToCustomerWallet);
router.post('/addToDriverWallet', billController.withdrawFromDriverWallet);
router.post('/customerWalletCheck', billController.checkCustomerWallet);
module.exports = router;