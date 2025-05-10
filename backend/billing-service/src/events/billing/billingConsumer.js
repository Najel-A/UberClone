const { createConsumer, consumerGroups, topics } = require("../../config/kafka");
const Bill = require("../../models/Bill");
const CustomerWallet = require("../../models/CustomerWallet");
const DriverWallet = require("../../models/DriverWallet");
const consumer = createConsumer(consumerGroups.BILLING_EVENTS);
const sequelize = require('../../config/db');

exports.startBillingConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: topics.RIDE_COMPLETED, fromBeginning: true });
    console.log(`📥 Subscribed to topic: ${topics.RIDE_COMPLETED}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const t = await sequelize.transaction();
        try {
          const { ride } = JSON.parse(message.value.toString());
          const customerWallet = await CustomerWallet.findOne({
            where: { ssn: ride.customerId },
            transaction: t,
            lock: t.LOCK.UPDATE,
          });

          const driverWallet = await DriverWallet.findOne({
            where: { ssn: ride.driverId },
            transaction: t,
            lock: t.LOCK.UPDATE,
          });
          if (!customerWallet) {
            throw new Error(`Customer wallet not found for ssn: ${ride.customerId}`);
          }
          if (!driverWallet) {
            throw new Error(`Driver wallet not found for ssn: ${ride.driverId}`);
          }
          // Transfer money
          customerWallet.wallet -= ride.price;
          driverWallet.wallet += ride.price;

          await customerWallet.save({ transaction: t });
          await driverWallet.save({ transaction: t });

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
          await t.commit();
          console.log("✅ Transaction: Wallets updated & bill inserted");
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
