const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

router.post('/addToCustomerWallet', billController.addToCustomerWallet);
router.post('/addToDriverWallet', billController.withdrawFromDriverWallet);
router.post('/customerWalletCheck', billController.checkCustomerWallet);
router.get('/getDriverWallet/:ssn', billController.getDriverWallet);
router.get('/getCustomerWallet/:ssn', billController.getCustomerWallet);
module.exports = router;