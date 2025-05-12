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

/* Inserting a middleware (after debug logging) to set Referrer-Policy header */
app.use((req, res, next) => {
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// CORS configuration
const allowedOrigins = [
  process.env.ADMIN_FRONTEND_URL,
  process.env.DRIVER_FRONTEND_URL,
  process.env.CUSTOMER_FRONTEND_URL,
  process.env.RIDE_SERVICE_URL,
  process.env.ADMIN_SERVICE_URL,
  "http://localhost:3000", // Admin service
  "http://localhost:3001", // Billing service
  "http://localhost:3002", // Customer service
  "http://localhost:3003", // Driver service
  "http://localhost:3004", // Driver frontend
  "http://localhost:3005", // Ride service
  "http://localhost:3006", // Admin frontend
  "http://localhost:3007", // Customer frontend
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        console.log("Blocked by CORS:", origin);
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      console.log("Allowed by CORS:", origin);
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "Origin",
      "Accept",
      "X-Requested-With",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Methods",
      "Access-Control-Allow-Credentials",
    ],
    exposedHeaders: ["set-cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());
app.use(express.urlencoded({ limit: "20mb", extended: true }));

app.use("/api/rides", rideRoutes);

startRideProgressConsumer();

module.exports = app;
