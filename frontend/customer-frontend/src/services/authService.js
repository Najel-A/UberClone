import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const authService = {
  async login(credentials) {
    try {
      const response = await axios.post(`${API_URL}/customers/login`, credentials);
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  async signup(userData) {
    try {
      // Transform the data to match backend expectations
      const signupData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        phoneNumber: userData.phoneNumber,
        address: userData.address,
        creditCardDetails: userData.creditCardDetails,
        _id: generateSSN() // Generate a random SSN format ID
      };
      
      const response = await axios.post(`${API_URL}/customers`, signupData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed';
      throw { message: errorMessage };
    }
  },

  logout() {
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// Helper function to generate a random SSN format ID
function generateSSN() {
  const part1 = Math.floor(Math.random() * 900 + 100).toString();
  const part2 = Math.floor(Math.random() * 90 + 10).toString();
  const part3 = Math.floor(Math.random() * 9000 + 1000).toString();
  return `${part1}-${part2}-${part3}`;
}

export default authService; 