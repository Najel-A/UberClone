const express = require("express");
const mongoose = require("mongoose");
const adminRoutes = require("./routes/adminRoutes");
const path = require("path");
const session = require("express-session");
const cors = require("cors");

require("dotenv").config();

const app = express();

// Add CORS configuration
app.use(
  cors({
    origin: "http://localhost:3004",
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

app.use("/api/admin", adminRoutes);

module.exports = app;
