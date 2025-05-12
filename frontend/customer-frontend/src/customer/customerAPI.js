import axios from 'axios';

export const getRideStatus = (rideId) =>
  axios.get(`${process.env.REACT_APP_RIDE_SERVICE_URL}/api/rides/${rideId}`);

export const submitDriverReview = (driverId, rating, review) =>
  axios.post(`${process.env.REACT_APP_DRIVER_SERVICE_URL}/api/drivers/${driverId}/review`, { rating, review });

export const cancelRide = (rideId) => {
  return axios.post(`${process.env.REACT_APP_RIDE_SERVICE_URL}/api/rides/${rideId}/cancel`, {
    cancelledBy: 'customer'
  });
};
