const express = require("express");
const mongoose = require("mongoose");
const driverRoutes = require("./routes/driverRoutes");
const multer = require("multer");
const path = require("path");
const session = require("express-session");
const cors = require("cors");

require("dotenv").config();

const app = express();

// CORS configuration
const allowedOrigins = [
  process.env.ADMIN_FRONTEND_URL,
  process.env.DRIVER_FRONTEND_URL,
  process.env.BILLING_SERVICE_URL,
  process.env.CUSTOMER_FRONTEND_URL,
].filter(Boolean); // Remove any undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
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
    ],
    exposedHeaders: ["set-cookie"],
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

const upload = multer({ dest: "uploads/" });
// Serve uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/drivers", driverRoutes);

module.exports = app;
