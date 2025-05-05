const { Kafka, Partitioners } = require("kafkajs");
const LocationService = require("../../services/locationService");
const PricingService = require("../../services/pricingService");
const RideService = require("../../services/rideService");
const { emitRideEvent, emitSuccessfulRideEvent } = require("./rideProducer");

const kafka = new Kafka({
  clientId: "ride-service",
  brokers: ["localhost:29092"], // or your Kafka broker list
});

const consumer = kafka.consumer({ groupId: "ride-group" });

const startConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "ride-requested", fromBeginning: false });

    console.log(
      "✅ Kafka consumer connected and subscribed to 'ride.requested'"
    );

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const rideRequest = JSON.parse(message.value.toString());

          // 1. Assign driver
          const drivers = await LocationService.findDriversWithinRadius(
            rideRequest.pickupLocation,
            10
          );

          if (!drivers.length) {
            console.warn("❌ No drivers found. Ride rejected.");
            // Optionally emit a failure event
            return;
          }

          rideRequest.driverId = drivers[0].id;

          // 2. Calculate price
          rideRequest.price = await PricingService.calculateRidePrice(
            rideRequest
          );
          console.log("Assigned Driver:", rideRequest.driverId);
          console.log("Calculated Price:", rideRequest.price);
          console.log("Ride Request:", rideRequest);

          // 3. Save to DB
          const ride = await RideService.createRide(rideRequest);

          // 4. Emit success event
          await emitSuccessfulRideEvent(ride);
          console.log("✅ Ride created and event emitted.");
        } catch (err) {
          console.error("❌ Error handling ride.requested:", err.message);
          // Optionally emit a 'ride.failed' event
        }
      },
    });
  } catch (err) {
    console.error("❌ Kafka consumer failed to start:", err.message);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down Kafka consumer...");
  await consumer.disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

module.exports = startConsumer;
