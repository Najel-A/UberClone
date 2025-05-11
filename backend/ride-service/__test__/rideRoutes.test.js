const axios = require("axios");

describe("Ride Routes", () => {
  const baseURL = "http://localhost:3004/api/rides";

  // Test for creating a new ride
  it("POST /api/rides - should create a new ride", async () => {
    const response = await axios.post(baseURL, {
      pickupLocation: { 
        latitude: 37.7749, 
        longitude: -122.4194, 
        address: "San Francisco, CA" 
      },
      dropoffLocation: { 
        latitude: 37.7849, 
        longitude: -122.4094, 
        address: "Market Street, San Francisco, CA" 
      },
      dateTime: "2025-05-10T10:00:00.000Z",
      customerId: "customer001",
      passenger_count: 1,
    });
  
    expect(response.status).toBe(202);
    expect(response.data.message).toBe("Ride request received and being processed");
  });

  // Test for getting nearby ride requests
  it("GET /api/rides/getRides - should fetch nearby ride requests", async () => {
    const response = await axios.get(`${baseURL}/getRides`, {
      params: { latitude: 37.7749, longitude: -122.4194 },
    });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  // Test for accepting a ride (need to fix)
//   it("POST /api/rides/acceptRide/:id - should accept a ride", async () => {
//     const validRideId = "68204b36aafde588c4eacccb";
//     const response = await axios.post(`${baseURL}/acceptRide/${rideId}`, {
//       driverId: "driver001",
//     });

//     expect(response.status).toBe(200);
//     expect(response.data.message).toBe("Ride accepted");
//   });

  // Test for marking a ride as completed
  it("POST /api/rides/rideCompleted - should mark a ride as completed", async () => {
    const response = await axios.post(`${baseURL}/rideCompleted`, {
      rideId: "ride123", // Replace with a valid ride ID for integration testing
      status: "completed",
    });

    expect(response.status).toBe(202);
    expect(response.data.message).toBe("Ride completed");
  });
});