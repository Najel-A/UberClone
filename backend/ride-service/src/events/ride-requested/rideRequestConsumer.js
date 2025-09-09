const { createConsumer, topics, consumerGroups } = require("../../config/kafka");
const LocationService = require("../../services/LocationService");

const startRideRequestedConsumer = async () => {
  try {
    const consumer = createConsumer(consumerGroups.RIDE_SERVICE); // Create consumer for the 'ride-service-group'
    
    await consumer.connect();
    await consumer.subscribe({ topic: topics.RIDE_REQUESTED, fromBeginning: false });
    console.log("✅ Ride requested consumer started.");

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const rideRequest = JSON.parse(message.value.toString());
        console.log("📥 Received ride request:", rideRequest);

        // TODO: Handle ride logic (assign driver, save to DB, etc.)
        
        // 1. Assign driver
        const drivers = Promise.all([LocationService.findDriversWithinRadiusWithCache(
            rideRequest.pickupLocation,
            10
        )]);
        console.log(drivers);


        rideRequest.driverId = drivers[0].id;

        // Send to next topic
        // await sendRideAssignedEvent(rideRequest);

      },
    });

  } catch (error) {
    console.error("❌ Failed to start ride requested consumer:", error);
  }
};

module.exports = startRideRequestedConsumer;
