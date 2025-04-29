const app = require('./src/app');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(3002, () => console.log('Customer service running on port 3002'));
  })
  .catch(err => console.error('DB connection failed', err));
