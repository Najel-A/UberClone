const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

router.post('/createCustomerWallet', billController.createCustomerWallet);
router.post('/createDriverWallet', billController.createDriverWallet);
router.post('/addToCustomerWallet', billController.addToCustomerWallet);
router.post('/withdrawFromCustomerWallet', billController.withdrawFromCustomerWallet);
router.post('/addToDriverWallet', billController.addToDriverWallet);
router.post('/withdrawFromDriverWallet', billController.withdrawFromDriverWallet);
router.post('/customerWalletCheck', billController.checkCustomerWallet);
router.delete('/deleteCustomerWallet', billController.deleteCustomerWallet);
router.delete('/deleteDriverWallet', billController.deleteDriverWallet);

module.exports = router;