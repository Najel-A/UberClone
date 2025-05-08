const axios = require('axios');
const geoUtils = require('../utils/geoUtils');

class LocationService {
  static async findDriversWithinRadius(centerPoint, radiusMiles) {
    try {
      // Temporary mock data until driver service is ready
      const mockDrivers = [
        {
          id: 'driver1',
          name: 'John Doe',
          location: {
            coordinates: [-74.0060, 40.7128]
          },
          rating: 4.5,
          available: true
        }
      ];
      
      return mockDrivers;

      // TODO: Uncomment when driver service is ready
      // const driverServiceUrl = process.env.DRIVER_SERVICE_URL || 'http://driver-service:3000';
      // const { data: drivers } = await axios.get(
      //   `${driverServiceUrl}/api/drivers/?minRating=3`
      // );
      // return drivers;
    } catch (error) {
      console.error('Error finding drivers:', error);
      return [];
    }
  }
}

module.exports = LocationService;
