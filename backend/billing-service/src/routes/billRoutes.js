const express = require("express");
const router = express.Router();
const billController = require("../controllers/billController");

router.post("/createCustomerWallet", billController.createCustomerWallet);
router.post("/createDriverWallet", billController.createDriverWallet);
router.post("/addToCustomerWallet", billController.addToCustomerWallet);
router.post("/addToDriverWallet", billController.withdrawFromDriverWallet);
router.post("/customerWalletCheck", billController.checkCustomerWallet);
router.get("/getDriverWallet/:ssn", billController.getDriverWallet);
router.get("/getCustomerWallet/:ssn", billController.getCustomerWallet);

// Bill routes
router.get("/bills", billController.getAllBills);
router.get("/bills/:id", billController.getBillById);

module.exports = router;
