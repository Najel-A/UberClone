// const { createConsumer, topics, consumerGroups } = require("../../config/kafka");
// const RideService = require("../../services/RideService");

// const startRideAssignedConsumer = async () => {
//   try {
//     const consumer = createConsumer(consumerGroups.RIDE_SERVICE); // Create consumer for the 'ride-service-group'
//     await consumer.connect();
//     await consumer.subscribe({ topic: topics.RIDE_ASSIGNED, fromBeginning: false });
//     console.log("✅ Ride assigned consumer started.");

//     await consumer.run({
//       eachMessage: async ({ topic, partition, message }) => {
//         const rideRequest = JSON.parse(message.value.toString());
//         console.log("📥 Received ride request:", rideRequest);

//         // Save to Database
//         RideService.createRide(rideRequest)
        
//         //  and begin ride simulation?

//       },
//     });

//   } catch (error) {
//     console.error("❌ Failed to start ride requested consumer:", error);
//   }
// };

// module.exports = startRideAssignedConsumer;
