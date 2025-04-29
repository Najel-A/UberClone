const Driver = require('../models/Driver');
const geoUtils = require('../utils/geoUtils');

class LocationService {
  static async findDriversWithinRadius(centerPoint, radiusMiles) {
    const drivers = await Driver.find({
      'location.coordinates': {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [centerPoint.longitude, centerPoint.latitude]
          },
          $maxDistance: radiusMiles * 1609.34 // Convert miles to meters
        }
      },
      isAvailable: true
    });
    
    return drivers.map(driver => ({
      driverId: driver._id,
      coordinates: driver.location.coordinates,
      distance: geoUtils.calculateDistance(
        centerPoint.latitude,
        centerPoint.longitude,
        driver.location.coordinates[1],
        driver.location.coordinates[0]
      )
    }));
  }
}

module.exports = LocationService;