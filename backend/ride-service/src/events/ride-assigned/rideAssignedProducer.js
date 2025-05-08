const { producer, topics, connectProducer } = require("../../config/kafka");
const RideService = require("../../services/RideService");

const emitRideAssigned = async (rideData) => {
  try {
    await connectProducer(); // Connect if not connected
    await producer.send({
      topic: topics.RIDE_ASSIGNED,
      messages: [
        {
          value: JSON.stringify(rideData),
        },
      ],
    });

    console.log("📤 Ride Assigned event sent:", rideData);
  } catch (error) {
    console.error("Failed to send ride assigned event:", error);
  }
};

module.exports = emitRideAssigned;
