const express = require('express');
const mongoose = require('mongoose');
const rideRoutes = require('./routes/rideRoutes');


require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ limit: '20mb', extended: true }));

app.use('/api/rides', rideRoutes);



module.exports = app;