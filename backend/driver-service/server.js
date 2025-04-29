const app = require('./src/app');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(3000, () => console.log('Driver service running on port 3001'));
  })
  .catch(err => console.error('DB connection failed', err));
