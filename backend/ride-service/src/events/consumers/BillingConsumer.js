// const { kafka, consumerGroups, topics } = require('../../config/kafka');
// const logger = require('../../utils/logger');
// const BillingService = require('../../services/BillingService');

// const consumer = kafka.consumer({ groupId: consumerGroups.BILLING_EVENTS });

// async function startBillingConsumer() {
//   await consumer.connect();
//   await consumer.subscribe({ topic: topics.BILLING, fromBeginning: true });

//   await consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       try {
//         const event = JSON.parse(message.value.toString());
//         logger.debug(`Processing billing event: ${event.eventType}`);

//         switch (event.eventType) {
//           case 'payment.processed':
//             await BillingService.handlePaymentProcessed(event.data);
//             break;
//           case 'payment.failed':
//             await BillingService.handlePaymentFailed(event.data);
//             break;
//           default:
//             logger.warn(`Unknown billing event type: ${event.eventType}`);
//         }
//       } catch (error) {
//         logger.error('Error processing billing event', error);
//       }
//     }
//   });
// }

// process.on('SIGTERM', async () => {
//   await consumer.disconnect();
// });

// module.exports = { startBillingConsumer };