// const { kafka, consumerGroups, topics } = require('../../config/kafka');
// const logger = require('../../utils/logger');
// const NotificationService = require('../../services/NotificationService');

// const consumer = kafka.consumer({ groupId: consumerGroups.NOTIFICATION_EVENTS });

// async function startNotificationConsumer() {
//   await consumer.connect();
//   await consumer.subscribe({ topic: topics.NOTIFICATIONS, fromBeginning: true });

//   await consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       try {
//         const event = JSON.parse(message.value.toString());
//         logger.debug(`Processing notification event: ${event.eventType}`);

//         switch (event.eventType) {
//           case 'ride.accepted':
//             await NotificationService.sendRideAcceptedNotification(event.data);
//             break;
//           case 'ride.completed':
//             await NotificationService.sendRideCompletedNotification(event.data);
//             break;
//           case 'driver.arrived':
//             await NotificationService.sendDriverArrivedNotification(event.data);
//             break;
//           default:
//             logger.warn(`Unknown notification event type: ${event.eventType}`);
//         }
//       } catch (error) {
//         logger.error('Error processing notification event', error);
//       }
//     }
//   });
// }

// process.on('SIGTERM', async () => {
//   await consumer.disconnect();
// });

// module.exports = { startNotificationConsumer };