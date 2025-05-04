const axios = require('axios');
const CircuitBreaker = require('../utils/circuitBreaker');

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
   * @param {Object} rideDetails - Ride details matching FastAPI's PredictionInput schema
   * @returns {Promise<Object>} - Price details including base, surge, and total
   */
  static async calculateRidePrice(rideDetails) {
    const fastApiUrl = process.env.FASTAPI_PRICE_URL || 'http://localhost:8000/predict';

    const requestData = {
      pickup_latitude: rideDetails.pickup_latitude,
      pickup_longitude: rideDetails.pickup_longitude,
      dropoff_latitude: rideDetails.dropoff_latitude,
      dropoff_longitude: rideDetails.dropoff_longitude,
      passenger_count: rideDetails.passenger_count,
      pickup_datetime: rideDetails.pickup_datetime,
    };

    try {
      const response = await mlServiceCircuitBreaker.call(() =>
        axios.post(fastApiUrl, requestData, {
          timeout: 2000,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      // Return the predicted fare from the response
      return response.data.predicted_fare;

    } catch (error) {
      console.error('FastAPI price calculation failed:', {
        message: error.message,
        rideDetails: requestData,
      });

      throw new Error('Price calculation service unavailable');
    }
  }
}

module.exports = PricingService;
