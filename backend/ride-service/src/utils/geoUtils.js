/**
 * GeoUtils - A collection of geospatial calculation utilities
 */

const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_MILES = 3959;
const KM_TO_MILES = 0.621371;

class GeoUtils {
  /**
   * Convert degrees to radians
   * @param {number} degrees - Angle in degrees
   * @returns {number} Angle in radians
   */
  static degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @param {number} lat1 - Latitude of point 1
   * @param {number} lon1 - Longitude of point 1
   * @param {number} lat2 - Latitude of point 2
   * @param {number} lon2 - Longitude of point 2
   * @param {string} unit - 'km' for kilometers, 'mi' for miles (default: 'km')
   * @returns {number} Distance between points in specified unit
   */
  static calculateDistance(lat1, lon1, lat2, lon2, unit = 'km') {
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) *
      Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = unit === 'km' 
      ? EARTH_RADIUS_KM * c 
      : EARTH_RADIUS_MILES * c;

    return parseFloat(distance.toFixed(2));
  }

  /**
   * Check if a point is within a given radius of another point
   * @param {number} centerLat - Latitude of center point
   * @param {number} centerLon - Longitude of center point
   * @param {number} pointLat - Latitude of point to check
   * @param {number} pointLon - Longitude of point to check
   * @param {number} radius - Radius in specified unit
   * @param {string} unit - 'km' or 'mi' (default: 'km')
   * @returns {boolean} True if point is within radius
   */
  static isWithinRadius(centerLat, centerLon, pointLat, pointLon, radius, unit = 'km') {
    const distance = this.calculateDistance(centerLat, centerLon, pointLat, pointLon, unit);
    return distance <= radius;
  }

  /**
   * Convert kilometers to miles
   * @param {number} km - Distance in kilometers
   * @returns {number} Distance in miles
   */
  static kmToMiles(km) {
    return km * KM_TO_MILES;
  }

  /**
   * Convert miles to kilometers
   * @param {number} miles - Distance in miles
   * @returns {number} Distance in kilometers
   */
  static milesToKm(miles) {
    return miles / KM_TO_MILES;
  }

  /**
   * Calculate bounding box coordinates around a point
   * @param {number} lat - Center latitude
   * @param {number} lon - Center longitude
   * @param {number} distance - Distance from center in km
   * @returns {Object} Bounding box coordinates {minLat, maxLat, minLon, maxLon}
   */
  static getBoundingBox(lat, lon, distance) {
    const radiusKm = distance;
    const latRadian = this.degreesToRadians(lat);

    const deltaLat = radiusKm / EARTH_RADIUS_KM;
    const deltaLon = radiusKm / (EARTH_RADIUS_KM * Math.cos(latRadian));

    const minLat = lat - this.radiansToDegrees(deltaLat);
    const maxLat = lat + this.radiansToDegrees(deltaLat);
    const minLon = lon - this.radiansToDegrees(deltaLon);
    const maxLon = lon + this.radiansToDegrees(deltaLon);

    return { minLat, maxLat, minLon, maxLon };
  }

  /**
   * Convert radians to degrees
   * @param {number} radians - Angle in radians
   * @returns {number} Angle in degrees
   */
  static radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  /**
   * Calculate the midpoint between two coordinates
   * @param {number} lat1 - Latitude of point 1
   * @param {number} lon1 - Longitude of point 1
   * @param {number} lat2 - Latitude of point 2
   * @param {number} lon2 - Longitude of point 2
   * @returns {Object} Midpoint coordinates {lat, lon}
   */
  static getMidpoint(lat1, lon1, lat2, lon2) {
    const φ1 = this.degreesToRadians(lat1);
    const λ1 = this.degreesToRadians(lon1);
    const φ2 = this.degreesToRadians(lat2);
    const λ2 = this.degreesToRadians(lon2);

    const Bx = Math.cos(φ2) * Math.cos(λ2 - λ1);
    const By = Math.cos(φ2) * Math.sin(λ2 - λ1);

    const φ3 = Math.atan2(
      Math.sin(φ1) + Math.sin(φ2),
      Math.sqrt((Math.cos(φ1) + Bx) * (Math.cos(φ1) + Bx) + By * By)
    );

    const λ3 = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);

    return {
      lat: this.radiansToDegrees(φ3),
      lon: this.radiansToDegrees(λ3)
    };
  }

  /**
   * Validate latitude and longitude values
   * @param {number} lat - Latitude to validate
   * @param {number} lon - Longitude to validate
   * @returns {boolean} True if coordinates are valid
   */
  static validateCoordinates(lat, lon) {
    return (
      lat >= -90 && lat <= 90 &&
      lon >= -180 && lon <= 180
    );
  }
}

module.exports = GeoUtils;