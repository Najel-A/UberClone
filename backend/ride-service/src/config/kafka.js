const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'ride-service',
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
//   ssl: process.env.KAFKA_SSL === 'true',
//   sasl: process.env.KAFKA_USERNAME ? {
//     mechanism: 'plain',
//     username: process.env.KAFKA_USERNAME,
//     password: process.env.KAFKA_PASSWORD
//   } : null,
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

// Admin client for topic management
const admin = kafka.admin();

// Producer instance (shared across producers)
const producer = kafka.producer();

// Consumer groups
const consumerGroups = {
  RIDE_EVENTS: 'ride-service-ride-events',
  BILLING_EVENTS: 'ride-service-billing',
  NOTIFICATION_EVENTS: 'ride-service-notifications'
};

// Topics
const topics = {
  RIDES: 'rides',
  DRIVER_LOCATIONS: 'driver-locations',
  BILLING: 'billing-events',
  NOTIFICATIONS: 'notification-events'
};

// Ensure topics exist
async function createTopics() {
  await admin.connect();
  const existingTopics = await admin.listTopics();
  
  const topicsToCreate = Object.values(topics)
    .filter(topic => !existingTopics.includes(topic))
    .map(topic => ({ topic }));
  
  if (topicsToCreate.length > 0) {
    await admin.createTopics({
      topics: topicsToCreate,
      waitForLeaders: true
    });
    console.log('Created Kafka topics:', topicsToCreate.map(t => t.topic));
  }
  
  await admin.disconnect();
}

module.exports = {
  kafka,
  producer,
  admin,
  topics,
  consumerGroups,
  initializeKafka: async () => {
    await createTopics();
    await producer.connect();
  }
};