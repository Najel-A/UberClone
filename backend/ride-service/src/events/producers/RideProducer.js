const { kafka, producer, topics } = require('../../config/kafka');
const logger = require('../../utils/logger');

class RideProducer {
  static async emitEvent(eventType, rideData) {
    try {
      const message = {
        key: rideData.id || rideData.rideId,
        value: JSON.stringify({
          eventType,
          timestamp: new Date().toISOString(),
          data: rideData
        })
      };

      await producer.send({
        topic: topics.RIDES,
        messages: [message]
      });

      logger.debug(`Produced ${eventType} event for ride ${message.key}`);
    } catch (error) {
      logger.error(`Failed to produce ${eventType} event`, error);
      throw error;
    }
  }

  static async rideCreated(ride) {
    return this.emitEvent('ride.created', ride);
  }

  static async rideUpdated(ride) {
    return this.emitEvent('ride.updated', ride);
  }

  static async rideCompleted(ride) {
    return this.emitEvent('ride.completed', ride);
  }

  static async rideCancelled(ride) {
    return this.emitEvent('ride.cancelled', ride);
  }
}

module.exports = RideProducer;