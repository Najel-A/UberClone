import axios from "axios";

const API_URL = process.env.REACT_APP_DRIVER_SERVICE_URL;

const api = axios.create({
  baseURL: `${API_URL}/api/drivers`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("driverToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const driverService = {
  // Auth
  login: (email, password) => api.post("/login", { email, password }),
  logout: () => api.post("/logout"),

  // Driver CRUD
  createDriver: (driverData) => api.post("/signup", driverData),
  getDriver: (id) => api.get(`/${id}`),
  updateDriver: (id, data) => api.put(`/${id}`, data),
  deleteDriver: (id) => api.delete(`/${id}`),

  // List and Search
  listDrivers: (filters = {}) => api.get("/", { params: filters }),

  // Video and Status
  getDriverVideo: (id) => api.get(`/${id}/video`),
  uploadDriverVideo: (id, formData) => 
    axios.post(`${process.env.REACT_APP_DRIVER_SERVICE_URL}/api/drivers/${id}/video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateDriverStatusAndLocation: (id, data) => api.put(`/${id}/status`, data),

  // Wallet
  getDriverWallet: (ssn) =>
    axios.get(`${process.env.REACT_APP_BILLING_SERVICE_URL}/api/billing/getDriverWallet/${ssn}`),

  // Profile Picture Upload
  uploadProfilePicture: (driverId, formData) =>
    axios.post(`${process.env.REACT_APP_DRIVER_SERVICE_URL}/api/drivers/${driverId}/profile-picture`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Get Driver Ride History
  getDriverRides: (driverId) =>
    axios.get(`${process.env.REACT_APP_RIDE_SERVICE_URL}/api/rides/driver/${driverId}`),
};

// Ride Matching APIs
export const rideService = {
  getAvailableRides: (latitude, longitude) =>
    axios.get(`${process.env.REACT_APP_RIDE_SERVICE_URL}/api/rides/getRides`, {
      params: { latitude, longitude },
    }),
  acceptRide: (rideId, driverId) =>
    axios.post(`${process.env.REACT_APP_RIDE_SERVICE_URL}/api/rides/acceptRide/${rideId}`, { driverId }),
  cancelRide: (rideId) =>
    axios.post(`${process.env.REACT_APP_RIDE_SERVICE_URL}/api/rides/${rideId}/cancel`, { cancelledBy: 'driver' }),
};

export default driverService;
