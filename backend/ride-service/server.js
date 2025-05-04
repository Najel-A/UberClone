const app = require('./src/app');
const mongoose = require('mongoose');
const { initializeKafka } = require('./src/config/kafka');
require('dotenv').config();
async function startKafkaConsumers() {
  try {
    await initializeKafka();
    await startBillingConsumer();
    await startNotificationConsumer();
    logger.info('Kafka consumers started successfully');
  } catch (error) {
    logger.error('Failed to start Kafka consumers', error);
    process.exit(1);
  }
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => console.log('Ride service running on port,', process.env.PORT));
  })
  .catch(err => console.error('DB connection failed', err));


// startKafkaConsumers();
