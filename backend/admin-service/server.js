const app = require('./src/app');
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => console.log('Admin service running on port ', process.env.PORT));
  })
  .catch(err => console.error('DB connection failed', err));
