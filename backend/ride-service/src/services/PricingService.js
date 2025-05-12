const axios = require("axios");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const CircuitBreaker = require("../utils/circuitBreaker");
const { MongoClient } = require("mongodb");

dayjs.extend(utc);
dayjs.extend(customParseFormat);

// Circuit breaker configuration for ML service
const mlServiceCircuitBreaker = new CircuitBreaker({
  name: "ml-price-predict",
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
});

// MongoDB client setup
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
const mongoClient = new MongoClient(mongoUri);

class PricingService {

  static async calculateRidePrice(rideDetails) {
    const fastApiUrl = process.env.FASTAPI_PRICE_URL || "http://localhost:8000/predict";
  
    let formattedDateTime = dayjs(rideDetails.dateTime)
      .utc()
      .format("YYYY-MM-DD HH:mm:ss.SSSSSS");
  
    try {
      const rideRequests = (await this.getRideRequestCount()) + 1;
      console.log("Number of ride requests:", rideRequests);
  
      const drivers = await this.getDriverCount();
      console.log("Number of drivers:", drivers);
  
      const requestData = {
        pickup_latitude: rideDetails.pickupLocation.latitude,
        pickup_longitude: rideDetails.pickupLocation.longitude,
        dropoff_latitude: rideDetails.dropoffLocation.latitude,
        dropoff_longitude: rideDetails.dropoffLocation.longitude,
        passenger_count: rideDetails.passenger_count,
        ride_requests: rideRequests,
        drivers: drivers,
      };
  
      const response = await mlServiceCircuitBreaker.call(() =>
        axios.post(fastApiUrl, requestData, {
          timeout: 2000,
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
  
      return response.data.fare;
    } catch (error) {
      console.error("FastAPI price calculation failed:", {
        message: error.message,
        rideDetails,
      });
  
      throw new Error("Price calculation service unavailable");
    }
  }

  static async getRideRequestCount() {
    try {
      await mongoClient.connect();
      const database = mongoClient.db("uberclone");
      const ridesCollection = database.collection("rides");

      const rideCount = await ridesCollection.countDocuments({ driverId: null });
      console.log("Number of ride requests from database:", rideCount);
      return rideCount;
    } catch (error) {
      console.error("Error retrieving ride request count from MongoDB:", error);
      return 0;
    } finally {
      await mongoClient.close();
    }
  }

  static async getDriverCount() {
    try {
      await mongoClient.connect();
      const database = mongoClient.db("uberclone");
      const driversCollection = database.collection("drivers");

      const driverCount = await driversCollection.countDocuments();
      return driverCount;
    } catch (error) {
      console.error("Error retrieving driver count from MongoDB:", error);
      return 0;
    } finally {
      await mongoClient.close();
    }
  }
}

module.exports = PricingService;
