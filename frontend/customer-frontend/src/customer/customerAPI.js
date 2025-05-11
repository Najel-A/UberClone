import axios from 'axios';

export const getRideStatus = (rideId) =>
  axios.get(`${process.env.REACT_APP_RIDE_SERVICE_URL}/api/rides/${rideId}`);
