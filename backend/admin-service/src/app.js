const express = require("express");
const mongoose = require("mongoose");
const adminRoutes = require("./routes/adminRoutes");
const path = require("path");
const session = require("express-session");
const cors = require("cors");

require("dotenv").config();

const app = express();

// Configure CORS
const allowedOrigins = [
  ...(process.env.FRONT_END_PORTS
    ? process.env.FRONT_END_PORTS.split(",").map(
        (port) => `http://localhost:${port.trim()}`
      )
    : ["http://localhost:3002"]),
  process.env.BILLING_SERVICE_URL || "http://billing-service:5004",
  process.env.RIDE_SERVICE_URL || "http://ride-service:5004",
  "http://localhost:5004"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge: 3600000, // 1 hour
    },
  })
);

app.use("/api/admin", adminRoutes);

module.exports = app;
