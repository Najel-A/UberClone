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
          console.log("📥 Processing completed ride for billing:", {
            customerId: ride.customerId,
            driverId: ride.driverId,
            price: ride.price
          });

          // Find customer wallet
          const customerWallet = await CustomerWallet.findOne({
            where: { ssn: ride.customerId },
            transaction: t,
            lock: t.LOCK.UPDATE,
          });
          console.log("🔎 Customer wallet lookup result:", customerWallet ? customerWallet.toJSON() : null);

          if (!customerWallet) {
            console.error(`❌ Customer wallet not found for ssn: ${ride.customerId}`);
            throw new Error(`Customer wallet not found for ssn: ${ride.customerId}`);
          }

          // Find driver wallet
          const driverWallet = await DriverWallet.findOne({
            where: { ssn: ride.driverId },
            transaction: t,
            lock: t.LOCK.UPDATE,
          });
          console.log("🔎 Driver wallet lookup result:", driverWallet ? driverWallet.toJSON() : null);

          if (!driverWallet) {
            console.error(`❌ Driver wallet not found for ssn: ${ride.driverId}`);
            throw new Error(`Driver wallet not found for ssn: ${ride.driverId}`);
          }

          // Check if customer has sufficient balance
          if (customerWallet.wallet < ride.price) {
            console.error(`❌ Insufficient balance in customer wallet. Required: ${ride.price}, Available: ${customerWallet.wallet}`);
            throw new Error(`Insufficient balance in customer wallet. Required: ${ride.price}, Available: ${customerWallet.wallet}`);
          }
          console.log(`💸 Sufficient balance. Deducting ${ride.price} from customer and adding to driver.`);

          // Transfer money
          const oldCustomerBalance = customerWallet.wallet;
          const oldDriverBalance = driverWallet.wallet;
          
          customerWallet.wallet -= ride.price;
          driverWallet.wallet += ride.price;

          await customerWallet.save({ transaction: t });
          console.log("✅ Customer wallet updated:", { old: oldCustomerBalance, new: customerWallet.wallet });
          await driverWallet.save({ transaction: t });
          console.log("✅ Driver wallet updated:", { old: oldDriverBalance, new: driverWallet.wallet });

          // Create bill record
          const bill = await Bill.create({
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
          }, { transaction: t });
          console.log("🧾 Bill record created:", bill.toJSON());

          await t.commit();
          
          console.log("✅ Transaction committed successfully:", {
            billId: bill.id,
            customerBalance: {
              old: oldCustomerBalance,
              new: customerWallet.wallet
            },
            driverBalance: {
              old: oldDriverBalance,
              new: driverWallet.wallet
            }
          });
        } catch (err) {
          await t.rollback();
          console.error("❌ Failed to process ride completion:", {
            error: err.message,
            stack: err.stack,
            ride: JSON.parse(message.value.toString()).ride
          });
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
