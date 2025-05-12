const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const upload = require('../utils/multer');

// Basic CRUD Routes
router.post('/customers', customerController.createCustomer);
router.post('/customers/login', customerController.loginCustomer);
router.delete('/customers/:id', customerController.deleteCustomer);
router.get('/customers', customerController.getAllCustomers);
router.post('/customers/logout', customerController.logoutCustomer);
router.put('/customers/:id', customerController.updateCustomer);

// Business logic routes
router.post('/customers/:id/generate-bill', customerController.generateBill);
router.get('/customers/:id/nearby-drivers', customerController.findNearbyDrivers);
router.post('/customers/:id/upload-images', upload.array('files'), customerController.uploadImages);

// Upload customer profile picture
router.post('/customers/:id/profile-picture', upload.single('profilePicture'), customerController.uploadProfilePicture);

router.get('/customers/:id', customerController.getCustomerById);

module.exports = router;
