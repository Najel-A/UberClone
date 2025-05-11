const { Kafka } = require('kafkajs');
const path =  require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });


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
  RIDE_COMPLETED: 'ride.completed',
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
  createConsumer,
  consumerGroups,
  initializeKafka: async () => {
    await createTopics();
    await producer.connect();
  }
};