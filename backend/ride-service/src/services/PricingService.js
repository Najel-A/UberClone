const axios = require('axios');
const GeoUtils = require('../utils/geoUtils');
const { CircuitBreaker } = require('../utils/circuitBreaker');

// Circuit breaker configuration for ML service
const mlServiceCircuitBreaker = new CircuitBreaker({
  name: 'ml-price-predict',
  timeout: 3000, // 3 seconds timeout
  errorThresholdPercentage: 50,
  resetTimeout: 30000, // 30 seconds before trying again
});

class PricingService {
  /**
   * Calculate ride price by calling the FastAPI service
   * @param {Object} rideDetails - Ride details including pickup/dropoff locations, time, etc.
   * @returns {Promise<Object>} - Price details including base, surge, and total
   */
  static async calculateRidePrice(rideDetails) {
    const fastApiUrl = process.env.FASTAPI_PRICE_URL || 'http://localhost:8000/calculate-price';

    const requestData = {
      pickup_location: rideDetails.pickupLocation,
      dropoff_location: rideDetails.dropoffLocation,
      estimated_time: rideDetails.estimatedTime,
      request_time: rideDetails.requestTime,
    };

    try {
      // Use circuit breaker for resilient calls
      const response = await mlServiceCircuitBreaker.call(() =>
        axios.post(fastApiUrl, requestData, {
          timeout: 2000,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      return {
        basePrice: response.data.base_price,
        surgeMultiplier: response.data.surge_multiplier,
        finalPrice: response.data.final_price,
        currency: response.data.currency || 'USD',
        priceComponents: response.data.price_components || {},
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('FastAPI price calculation failed', error);
      throw new Error('Price calculation service unavailable');
    }
  }
}

module.exports = PricingService;

