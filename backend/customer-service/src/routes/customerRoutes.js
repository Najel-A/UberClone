const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const upload = require('../utils/multer');

// Basic CRUD Routes
router.post('/customers', customerController.createCustomer);
router.post('/customers/login', customerController.loginCustomer);
router.delete('/customers/:id', customerController.deleteCustomer);
router.get('/customers', customerController.getAllCustomers);
router.get('/customers/:id', customerController.getCustomer);
router.put('/customers/:id', customerController.updateCustomer);
router.post('/customers/logout', customerController.logoutCustomer);

// Business logic routes
router.post('/customers/:id/generate-bill', customerController.generateBill);
router.get('/customers/:id/nearby-drivers', customerController.findNearbyDrivers);
router.post('/customers/:id/upload-images', upload.array('files'), customerController.uploadImages);

module.exports = router;
