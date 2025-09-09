const { producer, topics, connectProducer } = require("../../config/kafka");

const emitRideRequested = async (rideData) => {
  try {
    // await connectProducer(); // Connect if not connected
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
