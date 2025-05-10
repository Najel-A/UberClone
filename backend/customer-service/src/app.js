const express = require('express');
const customerRoutes = require('./routes/customerRoutes');
const path = require('path');
const session = require('express-session');
const cors = require('cors');

require('dotenv').config();

const app = express();

// Enable CORS for frontend
app.use(cors({
    origin: 'http://localhost:3002',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true if using HTTPS
      maxAge: 3600000 // 1 hour
    }
  }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


app.use('/api', customerRoutes);

module.exports = app;