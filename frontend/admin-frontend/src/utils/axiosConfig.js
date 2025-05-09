// src/utils/axiosConfig.js
import axios from "axios";

// Configure Axios globally
axios.defaults.baseURL = process.env.REACT_APP_ADMIN_BACKEND_PORT_URL; // Your API URL
axios.defaults.withCredentials = true; // Send credentials (cookies) with every request

export default axios;
