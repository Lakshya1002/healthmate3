import axios from 'axios';

// Create an Axios instance
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // 🔁 Adjust if needed
});

// Add a request interceptor to include the token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
