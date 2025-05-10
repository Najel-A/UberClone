const express = require('express');
const customerRoutes = require('./routes/rideRoutes');
const path = require('path');

const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(cors);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


app.use('/api', customerRoutes);

module.exports = app;