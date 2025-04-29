const { kafka, producer, topics } = require('../../config/kafka');
const logger = require('../../utils/logger');

class LocationProducer {
  static async updateDriverLocation(driverId, location) {
    try {
      const message = {
        key: driverId,
        value: JSON.stringify({
          eventType: 'driver.location.updated',
          timestamp: new Date().toISOString(),
          data: {
            driverId,
            latitude: location.latitude,
            longitude: location.longitude,
            heading: location.heading,
            speed: location.speed
          }
        })
      };

      await producer.send({
        topic: topics.DRIVER_LOCATIONS,
        messages: [message]
      });

      logger.debug(`Updated location for driver ${driverId}`);
    } catch (error) {
      logger.error('Failed to produce driver location update', error);
      throw error;
    }
  }
}

module.exports = LocationProducer;