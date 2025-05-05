const axios = require("axios");
const geoUtils = require("../utils/geoUtils");
const redisClient = require("../config/redis");

class LocationService {
  static async findDriversWithinRadius(centerPoint, radiusMiles) {
    // Call driver-service to get all available drivers with coordinates
    const { data: drivers } = await axios.get(
      process.env.LOCATION_SERVICE_PORT // Adjust this later when we use actual location
    );
    console.log(drivers);

    // Update the model Driver-Service to include location coordinates
    // const filteredDrivers = drivers
    //   .map(driver => {
    //     const [driverLon, driverLat] = driver.location.coordinates;
    //     const distance = geoUtils.calculateDistance(
    //       centerPoint.latitude,
    //       centerPoint.longitude,
    //       driverLat,
    //       driverLon
    //     );

    //     return {
    //       driverId: driver._id,
    //       coordinates: [driverLon, driverLat],
    //       distance
    //     };
    //   })
    //   .filter(driver => driver.distance <= radiusMiles);

    // // Sort by distance
    // filteredDrivers.sort((a, b) => a.distance - b.distance);

    // return filteredDrivers;
    return drivers;
  }

  static async findDriversWithinRadiusWithCache(
    centerPoint,
    radiusMiles,
    redisClient
  ) {
    const nearbyDriversCacheKey = `nearby_drivers:${centerPoint.latitude}:${centerPoint.longitude}`;
    let nearbyDrivers = await redisClient.get(nearbyDriversCacheKey);

    if (!nearbyDrivers) {
      console.log("Cache miss - fetching drivers from service");
      nearbyDrivers = await LocationService.findDriversWithinRadius(
        centerPoint,
        radiusMiles
      );
      await redisClient.set(
        nearbyDriversCacheKey,
        JSON.stringify(nearbyDrivers),
        "EX",
        60
      );
      console.log("Cached drivers for 60 seconds");
    } else {
      console.log("Cache hit - using cached drivers");
      nearbyDrivers = JSON.parse(nearbyDrivers);
    }

    return nearbyDrivers;
  }

  static async testRedisCaching(redisClient) {
    const testCenterPoint = { latitude: 40.7128, longitude: -74.006 }; // Example: New York City
    const testRadiusMiles = 10;

    console.log("Testing Redis caching...");

    // First call: should be a cache miss
    const firstResult = await LocationService.findDriversWithinRadiusWithCache(
      testCenterPoint,
      testRadiusMiles,
      redisClient
    );
    console.log("First call result:", firstResult);

    // Second call: should be a cache hit
    const secondResult = await LocationService.findDriversWithinRadiusWithCache(
      testCenterPoint,
      testRadiusMiles,
      redisClient
    );
    console.log("Second call result:", secondResult);

    return { firstResult, secondResult };
  }
}

module.exports = LocationService;
