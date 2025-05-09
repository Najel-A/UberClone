// src/utils/axiosConfig.js
import axios from "axios";
import { apiUrl } from "./config";

// Configure Axios globally
axios.defaults.baseURL = apiUrl; // Your API URL
axios.defaults.withCredentials = true; // Send credentials (cookies) with every request

export default axios;
