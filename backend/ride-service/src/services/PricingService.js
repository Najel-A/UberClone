const axios = require("axios");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const CircuitBreaker = require("../utils/circuitBreaker");

dayjs.extend(utc);
dayjs.extend(customParseFormat);

// Circuit breaker configuration for ML service
const mlServiceCircuitBreaker = new CircuitBreaker({
  name: "ml-price-predict",
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
});

class PricingService {
  static async calculateRidePrice(rideDetails) {
    const fastApiUrl =
      process.env.FASTAPI_PRICE_URL || "http://localhost:8000/predict";

    const formattedDateTime = dayjs(rideDetails.dateTime)
      .utc()
      .format("YYYY-MM-DD HH:mm:ss.SSSSSS");

    const requestData = {
      pickup_latitude: rideDetails.pickupLocation.latitude,
      pickup_longitude: rideDetails.pickupLocation.longitude,
      dropoff_latitude: rideDetails.dropoffLocation.latitude,
      dropoff_longitude: rideDetails.dropoffLocation.longitude,
      passenger_count: rideDetails.passenger_count,
      pickup_datetime: formattedDateTime,
    };

    try {
      const response = await mlServiceCircuitBreaker.call(() =>
        axios.post(fastApiUrl, requestData, {
          timeout: 2000,
          headers: {
            "Content-Type": "application/json",
          },
        })
      );

      return response.data.predicted_fare;
    } catch (error) {
      console.error("FastAPI price calculation failed:", {
        message: error.message,
        rideDetails: requestData,
      });

      throw new Error("Price calculation service unavailable");
    }
  }
}

module.exports = PricingService;