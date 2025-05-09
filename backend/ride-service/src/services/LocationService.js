// const axios = require("axios");
// const geoUtils = require("../utils/geoUtils");
// const redisClient = require("../config/redis");

// class LocationService {
//   static async findDriversWithinRadius(centerPoint, radiusMiles) {
//     // Call driver-service to get all available drivers with coordinates
//     const { data: drivers } = await axios.get(
//       process.env.LOCATION_SERVICE_PORT // Adjust this later when we use actual location
//     );
//     console.log(drivers);

//     // Update the model Driver-Service to include location coordinates
//     // const filteredDrivers = drivers
//     //   .map(driver => {
//     //     const [driverLon, driverLat] = driver.location.coordinates;
//     //     const distance = geoUtils.calculateDistance(
//     //       centerPoint.latitude,
//     //       centerPoint.longitude,
//     //       driverLat,
//     //       driverLon
//     //     );

//     //     return {
//     //       driverId: driver._id,
//     //       coordinates: [driverLon, driverLat],
//     //       distance
//     //     };
//     //   })
//     //   .filter(driver => driver.distance <= radiusMiles);

//     // // Sort by distance
//     // filteredDrivers.sort((a, b) => a.distance - b.distance);

//     // return filteredDrivers;
//     return drivers;
//   }

//   static async findDriversWithinRadiusWithCache(
//     centerPoint,
//     radiusMiles,
//     redisClient
//   ) {
//     const nearbyDriversCacheKey = `nearby_drivers:${centerPoint.latitude}:${centerPoint.longitude}`;
//     let nearbyDrivers = await redisClient.get(nearbyDriversCacheKey);

//     if (!nearbyDrivers) {
//       console.log("Cache miss - fetching drivers from service");
//       nearbyDrivers = await LocationService.findDriversWithinRadius(
//         centerPoint,
//         radiusMiles
//       );
//       await redisClient.set(
//         nearbyDriversCacheKey,
//         JSON.stringify(nearbyDrivers),
//         "EX",
//         60
//       );
//       console.log("Cached drivers for 60 seconds");
//     } else {
//       console.log("Cache hit - using cached drivers");
//       nearbyDrivers = JSON.parse(nearbyDrivers);
//     }

//     return nearbyDrivers;
//   }

//   static async testRedisCaching(redisClient) {
//     const testCenterPoint = { latitude: 40.7128, longitude: -74.006 }; // Example: New York City
//     const testRadiusMiles = 10;

//     console.log("Testing Redis caching...");

//     // First call: should be a cache miss
//     const firstResult = await LocationService.findDriversWithinRadiusWithCache(
//       testCenterPoint,
//       testRadiusMiles,
//       redisClient
//     );
//     console.log("First call result:", firstResult);

//     // Second call: should be a cache hit
//     const secondResult = await LocationService.findDriversWithinRadiusWithCache(
//       testCenterPoint,
//       testRadiusMiles,
//       redisClient
//     );
//     console.log("Second call result:", secondResult);

//     return { firstResult, secondResult };
//   }
// }

// module.exports = LocationService;


const axios = require("axios");
const geoUtils = require("../utils/geoUtils");
const redisClient = require("../config/redis");

class LocationService {
  static async findDriversWithinRadius(centerPoint, radiusMiles) {
    try {
      const { data: drivers } = await axios.get(
        `${process.env.DRIVER_SERVICE_URL}`,
        { timeout: 5000 } // 5-second timeout
      );

      // return drivers.map(driver => {
      //   const [driverLon, driverLat] = driver.location.coordinates;
      //   const distance = geoUtils.calculateDistance(
      //     centerPoint.latitude,
      //     centerPoint.longitude,
      //     driverLat,
      //     driverLon
      //   );

      //   return {
      //     ...driver,
      //     distance
      //   };
      // })
      // .filter(driver => driver.distance <= radiusMiles)
      // .sort((a, b) => a.distance - b.distance);

      return drivers;

    } catch (error) {
      console.error("Failed to fetch drivers:", error.message);
      throw new Error("Driver service unavailable");
    }
  }

  static async findDriversWithinRadiusWithCache(centerPoint, radiusMiles) {
    if (!redisClient.isOpen) {
      console.warn("Redis not connected, falling back to direct query");
      return this.findDriversWithinRadius(centerPoint, radiusMiles);
    }

    const cacheKey = `drivers:${centerPoint.latitude}:${centerPoint.longitude}:${radiusMiles}`;
    
    try {
      // 1. Try to get cached results
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        console.log("Cache hit - returning cached drivers");
        return JSON.parse(cached);
      }

      // 2. Cache miss - fetch fresh data
      console.log("Cache miss - querying driver service");
      const freshData = await this.findDriversWithinRadius(centerPoint, radiusMiles);
      
      // 3. Cache with TTL (60 seconds)
      await redisClient.setEx(cacheKey, 60, JSON.stringify(freshData));
      
      return freshData;

    } catch (error) {
      console.error("Redis operation failed:", error.message);
      return this.findDriversWithinRadius(centerPoint, radiusMiles);
    }
  }

  static async warmUpCache() {
    if (!redisClient.isOpen) return;
    
    const popularLocations = [
      { lat: 40.7128, lng: -74.0060 }, // NYC
      { lat: 34.0522, lng: -118.2437 } // LA
    ];
    
    await Promise.all(
      popularLocations.map(loc => 
        this.findDriversWithinRadiusWithCache(
          { latitude: loc.lat, longitude: loc.lng },
          10
        )
      )
    );
  }
}

module.exports = LocationService;