const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

router.post('/', billController.createBill);
router.delete('/:id', billController.deleteBill);
router.get('/:id', billController.searchBill);

module.exports = router;