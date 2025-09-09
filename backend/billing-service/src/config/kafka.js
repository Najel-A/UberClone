const { Kafka } = require('kafkajs');
const path =  require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });


const kafka = new Kafka({
  clientId: 'billing-service',
  brokers: [process.env.KAFKA_BROKERS],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});



// Consumer groups
const createConsumer = (groupId) => {
  const consumer = kafka.consumer({
    groupId: groupId,
  });
  return consumer;
};
const consumerGroups = {
  BILLING_EVENTS: 'billing-service-ride-completed',
};
// Topics
const topics = {
  RIDE_COMPLETED: 'ride.completed',
};

// Ensure topics exist

module.exports = {
  kafka,
  topics,
  createConsumer,
  consumerGroups,
};