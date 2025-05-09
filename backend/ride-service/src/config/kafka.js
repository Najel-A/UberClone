const { Kafka } = require('kafkajs');
const path =  require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });


// Kafka client configuration
const kafka = new Kafka({
  clientId: 'ride-service',
  brokers: [process.env.KAFKA_BROKERS],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const admin = kafka.admin();
const producer = kafka.producer();
const consumers = []; // Track all consumers created

// Consumer groups
const createConsumer = (groupId) => {
  const consumer = kafka.consumer({
    groupId: groupId,
  });
  return consumer;
};
const consumerGroups = {
  RIDE_EVENTS: 'ride-service-ride-events',
};
// Topics
const topics = {
  RIDE_REQUESTS: 'ride.requested',
};

const consumerGroups = {
  RIDE_SERVICE: 'ride-service-group',
  BILLING_SERVICE: 'billing-service-group',
  LOCATION_TRACKER: 'location-tracker-group'
};

// Create topics if they don’t exist
async function createTopics() {
  await admin.connect();
  const existingTopics = await admin.listTopics();

  const topicsToCreate = Object.values(topics)
    .filter(topic => !existingTopics.includes(topic))
    .map(topic => ({
      topic,
      numPartitions: 3,
      replicationFactor: 1
    }));

  if (topicsToCreate.length > 0) {
    await admin.createTopics({
      topics: topicsToCreate,
      waitForLeaders: true
    });
    console.log('✅ Created Kafka topics:', topicsToCreate.map(t => t.topic));
  }

  await admin.disconnect();
}

// Factory to create and track a Kafka consumer
const createConsumer = (groupId) => {
  const consumer = kafka.consumer({
    groupId: groupId,
    sessionTimeout: 30000,      // Increase from default (10s)
    rebalanceTimeout: 60000,    // Time to wait for members to join (default: 60s)
    heartbeatInterval: 3000,    // Send heartbeats more frequently (default: 3s)
    maxPollInterval: 300000,    // Increase if processing is slow (default: 5m)
  });
  consumers.push(consumer);
  return consumer;
};

// Initialize Kafka (topics + producer)
async function initializeKafka() {
  await createTopics();
  await producer.connect();
  console.log('✅ Kafka producer connected and topics initialized.');
}

async function connectProducer() {
  await producer.connect();
  console.log('Kafka Producer Connected');
}

// Graceful shutdown: disconnect producer and all consumers
async function shutdownKafka() {
  try {
    await producer.disconnect();
    console.log('🛑 Kafka producer disconnected.');

    for (const consumer of consumers) {
      await consumer.disconnect();
      console.log('🛑 Kafka consumer disconnected.');
    }
  } catch (err) {
    console.error('❌ Kafka shutdown error:', err);
  }
}

module.exports = {
  kafka,
  producer,
  admin,
  topics,
  createConsumer,
  consumerGroups,
  initializeKafka,
  shutdownKafka,
  createConsumer,
  connectProducer,
};