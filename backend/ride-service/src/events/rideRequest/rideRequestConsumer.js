const { createConsumer, consumerGroups, topics } = require("../../config/kafka");
const Ride = require("../../models/Ride");
const consumer = createConsumer(consumerGroups.RIDE_EVENTS);

exports.startRideRequestConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: topics.RIDE_REQUESTS, fromBeginning: true });
    console.log(topics.RIDE_REQUESTS);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const ride = new Ride(JSON.parse(message.value.toString()));
          return await ride.save();
          console.log("saved to db ");
        }catch (err) {
          console.error("❌ Failed to save to db:", err.message);
        }
      },
    });

    console.log("✅ Test consumer is running and subscribed to 'ride.requests'");
  } catch (err) {
    console.error("❌ Failed to start test consumer:", err.message);
  }
};

exports.shutdownTestConsumer = async () => {
  console.log("🛑 Shutting down test consumer...");
  await consumer.disconnect();
};
