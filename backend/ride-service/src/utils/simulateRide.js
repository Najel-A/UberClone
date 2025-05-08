/*
*   Simulate Ride
* @start is a object pickupLocation { long, lat }
* @end is a object dropoffLocation { long, lat }
* @steps is the amount of updates for the ride (Default 20 should be good)
*/

const { redisPublisher } = require("../config/redis");

exports.simulateRide = async (rideId, start, end, steps = 20, delay = 500) => {
  const latStep = (end.latitude - start.latitude) / steps;
  const lngStep = (end.longitude - start.longitude) / steps;

  for (let i = 0; i <= steps; i++) {
    const lat = start.lat + latStep * i;
    const lng = start.lng + lngStep * i;

    // modify payload?
    const payload = {
      rideId,
      location: { latitude: lat, longitude: lng },
      timestamp: Date.now(),
    };

    // Publish location to Redis
    await redisPublisher.publish("ride-events", JSON.stringify(payload));

    // Wait before sending next update
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  return { success: true };
};
