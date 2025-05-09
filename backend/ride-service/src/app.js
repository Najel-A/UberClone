const express = require('express');
const mongoose = require('mongoose');
const rideRoutes = require('./routes/rideRoutes');
const redisClient = require('./config/redis');


require('dotenv').config();

const app = express();
app.use((req, res, next) => {
    req.redisClient = redisClient; // Pass the Redis client to your routes
    next();
  });
app.use(express.json());
app.use(express.urlencoded({ limit: '20mb', extended: true }));

app.use('/api/rides', rideRoutes);




module.exports = app;