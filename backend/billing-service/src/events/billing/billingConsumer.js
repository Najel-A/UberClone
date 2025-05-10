const { createConsumer, consumerGroups, topics } = require("../../config/kafka");
const Bill = require("../../models/Bill");

const consumer = createConsumer(consumerGroups.BILLING_EVENTS);

exports.startBillingConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: topics.RIDE_COMPLETED, fromBeginning: true });
    console.log(`📥 Subscribed to topic: ${topics.RIDE_COMPLETED}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const { ride } = JSON.parse(message.value.toString());
          console.log(ride);
          
          await Bill.create({
            date: ride.createdAt,
            pickupTime: ride.dateTime,
            dropoffTime: ride.updatedAt,
            distanceCovered: ride.distanceCovered,
            totalAmount: ride.price,
            pickupLocation: ride.pickupLocation.address,
            dropoffLocation: ride.dropoffLocation.address,
            driverId: ride.driverId,
            customerId: ride.customerId,
            status: "completed"
          });

          console.log("✅ Bill inserted into MySQL via Sequelize");
        } catch (err) {
          console.error("❌ Failed to save bill:", err.message);
        }
      },
    });

    console.log("✅ Billing consumer is running and listening to 'ride.completed'");
  } catch (err) {
    console.error("❌ Failed to start billing consumer:", err.message);
  }
};

exports.shutdownBillingConsumer = async () => {
  console.log("🛑 Shutting down billing consumer...");
  await consumer.disconnect();
};
