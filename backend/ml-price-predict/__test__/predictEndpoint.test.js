const axios = require('axios');

describe('Prediction Endpoint', () => {

  it('should return a fare of 12.63 for specific prediction data', async () => {
    const requestData = {
      pickup_latitude: 37.7749,
      pickup_longitude: -122.4194,
      dropoff_latitude: 37.7849,
      dropoff_longitude: -122.4094,
      passenger_count: 1,
      ride_requests: 1,
      drivers: 1,
    };

    const response = await axios.post('http://localhost:8000/predict', requestData);

    expect(response.status).toBe(200); 
    expect(response.data).toHaveProperty('fare'); 
    expect(response.data.fare).toBe(12.63);
  });

  it('should return a fare of 31.59 for specific prediction data', async () => {
    const requestData = {
      pickup_latitude: 37.7749,
      pickup_longitude: -122.4194,
      dropoff_latitude: 37.7849,
      dropoff_longitude: -122.4094,
      passenger_count: 1,
      ride_requests: 3,
      drivers: 1,
    };

    const response = await axios.post('http://localhost:8000/predict', requestData);

    expect(response.status).toBe(200); 
    expect(response.data).toHaveProperty('fare'); 
    expect(response.data.fare).toBe(31.59);
  });


  it('should return a fare of 54.49 for specific prediction data', async () => {
    const requestData = {
      pickup_latitude: 40.748817,
      pickup_longitude: -73.985428,
      dropoff_latitude: 40.641311,
      dropoff_longitude: -73.778139,
      passenger_count: 1,
      ride_requests: 1,
      drivers: 1,
    };

    const response = await axios.post('http://localhost:8000/predict', requestData);

    expect(response.status).toBe(200); 
    expect(response.data).toHaveProperty('fare'); 
    expect(response.data.fare).toBe(54.49);
  });
});