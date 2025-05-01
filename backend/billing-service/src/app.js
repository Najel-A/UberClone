require('dotenv').config();
const express = require('express');
const cors = require('cors');
const billingRoutes = require('./routes/billRoutes');

// Express app
const app = express();


// Body parsing middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/billing', billingRoutes);

module.exports = app;