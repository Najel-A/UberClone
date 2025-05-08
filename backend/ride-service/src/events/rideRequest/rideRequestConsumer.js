const { createConsumer, consumerGroups, topics } = require("../../config/kafka");

const consumer = createConsumer(consumerGroups.RIDE_EVENTS);

exports.startRideRequestConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: topics.RIDE_REQUESTS, fromBeginning: true });
    console.log(topics.RIDE_REQUESTS);
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log({
          partition,
          offset: message.offset,
          value: message.value.toString(),
        });
      },
    });

    console.log("✅ Test consumer is running and subscribed to 'test-topic'");
  } catch (err) {
    console.error("❌ Failed to start test consumer:", err.message);
  }
};

exports.shutdownTestConsumer = async () => {
  console.log("🛑 Shutting down test consumer...");
  await consumer.disconnect();
};
