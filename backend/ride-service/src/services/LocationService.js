const axios = require('axios');
const geoUtils = require('../utils/geoUtils');

class LocationService {
  static async findDriversWithinRadius(centerPoint, radiusMiles) {
    // Call driver-service to get all available drivers with coordinates
    const { data: drivers } = await axios.get(
      `http://localhost:3001/api/drivers/?minRating=3` // Adjust this later when we use actual location
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
}

module.exports = LocationService;
