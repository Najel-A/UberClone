/*
*   Simulate Ride
* @start is a object pickupLocation { long, lat }
* @end is a object dropoffLocation { long, lat }
* @steps is the amount of updates for the ride (Default 20 should be good)
*/

const { redisPublisher } = require("../config/redis");
const axios = require('axios');

exports.simulateRide = async (rideId, start, end, steps = 20, delay = 500) => {
  console.log('Start:', start);
  console.log('END:', end)
  const latStep = (end.latitude - start.latitude) / steps;
  const lngStep = (end.longitude - start.longitude) / steps;


  for (let i = 0; i <= steps; i++) {
    const latitude = start.latitude + latStep * i;
    const longitude = start.longitude + lngStep * i;

    // modify payload?
    const payload = {
      rideId,
      location: { latitude: latitude, longitude: longitude },
      timestamp: Date.now(),
      last: i === steps // Mark the last event
    };

    // Publish location to Redis, and emit ride
    await redisPublisher.publish("ride-events", JSON.stringify(payload));

    // Wait before sending next update
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // After simulation, trigger ride completion for wallet update
  try {
    const rideServiceUrl = process.env.RIDE_SERVICE_URL || 'http://localhost:3005';
    await axios.post(`${rideServiceUrl}/api/rides/rideCompleted`, { id: rideId });
    console.log(`🚦 Triggered ride completion for rideId: ${rideId}`);
  } catch (err) {
    console.error(`❌ Failed to trigger ride completion for rideId: ${rideId}`, err.message);
  }

  return { success: true };
};
