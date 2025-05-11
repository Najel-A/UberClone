const redis = require('redis');
const Ride = require('../../models/Ride');

// Create a Redis client and subscribe to 'ride-events'
const redisClient = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

redisClient.on('error', (err) => console.error('Redis Client Error', err));

async function startRideProgressConsumer() {
  await redisClient.connect();
  await redisClient.subscribe('ride-events', async (message) => {
    try {
      const event = JSON.parse(message);
      const { rideId, location, last } = event;
      // Calculate distance covered (simple: Haversine from pickup to current location)
      const ride = await Ride.findById(rideId);
      if (!ride) return;
      const toRad = (x) => x * Math.PI / 180;
      const lat1 = ride.pickupLocation.latitude;
      const lon1 = ride.pickupLocation.longitude;
      const lat2 = location.latitude;
      const lon2 = location.longitude;
      const R = 3958.8; // miles
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      // Update ride's distanceCovered and, if last event, mark as completed
      const update = { distanceCovered: distance };
      if (last) {
        update.status = 'completed';
      }
      await Ride.findByIdAndUpdate(rideId, update);
    } catch (err) {
      console.error('Failed to process ride event:', err);
    }
  });
  console.log('✅ Ride progress consumer is running and subscribed to ride-events');
}

module.exports = { startRideProgressConsumer }; 