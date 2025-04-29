const express = require('express');
const mongoose = require('mongoose');
// const customerRoutes = require('./routes/customerRoutes');
const multer = require('multer');
const path = require('path');
const session = require('express-session');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true if using HTTPS
      maxAge: 3600000 // 1 hour
    }
  }));

const upload = multer({ dest: 'uploads/' });
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use('/api', customerRoutes);

module.exports = app;