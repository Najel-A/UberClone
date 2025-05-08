


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

      // TODO: figure out driver matching

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