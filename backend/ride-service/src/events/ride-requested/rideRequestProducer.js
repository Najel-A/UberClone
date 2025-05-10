const { producer, topics, connectProducer } = require("../../config/kafka");

const emitRideRequested = async (rideData) => {
  try {
    if (!producer.isConnected()) {
      console.warn("Kafka producer is not connected. Attempting to reconnect...");
      await producer.connect();
    }

    await producer.send({
      topic: topics.RIDE_REQUESTED,
      messages: [
        {
          value: JSON.stringify(rideData),
        },
      ],
    });

    console.log("📤 Ride request event sent:", rideData);
  } catch (error) {
    console.error("Failed to send ride request event:", error);
  }
};

module.exports = {
  emitRideRequested,
};
