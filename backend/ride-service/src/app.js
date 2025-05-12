const express = require("express");
const mongoose = require("mongoose");
const rideRoutes = require("./routes/rideRoutes");
const redisClient = require("./config/redis");
const cors = require("cors");
const {
  startRideProgressConsumer,
} = require("./events/ride-updated/rideProgressConsumer");

require("dotenv").config();

const app = express();

// Debug logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  req.redisClient = redisClient; // Pass the Redis client to your routes
  next();
});

app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "Origin",
      "Accept",
    ],
    exposedHeaders: ["set-cookie"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ limit: "20mb", extended: true }));

app.use("/api/rides", rideRoutes);

startRideProgressConsumer();

module.exports = app;
