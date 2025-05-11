const express = require('express');
const mongoose = require('mongoose');
const rideRoutes = require('./routes/rideRoutes');
const redisClient = require('./config/redis');
const cors = require('cors');
const { startRideProgressConsumer } = require('./events/ride-updated/rideProgressConsumer');

require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
app.use((req, res, next) => {
    req.redisClient = redisClient; // Pass the Redis client to your routes
    next();
  });
app.use(express.json());
app.use(express.urlencoded({ limit: '20mb', extended: true }));

app.use('/api/rides', rideRoutes);

startRideProgressConsumer();

module.exports = app;