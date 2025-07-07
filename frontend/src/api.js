// frontend/src/api.js

import axios from 'axios';

// Create a centralized Axios instance.
// The `proxy` in vite.config.js will handle redirecting `/api` requests
// to the backend server during development.
const api = axios.create({
  baseURL: '/api',
});

/**
 * Attaches the JWT to the Authorization header for all subsequent API requests.
 * @param {string | null} token - The user's JWT.
 */
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// --- API Call Functions ---

// Auth
export const loginUser = (userData) => api.post('/auth/login', userData);
export const registerUser = (userData) => api.post('/auth/register', userData);
// This function was missing. It fetches the current user's profile.
export const getMe = () => api.get('/auth/me');

// Medicines
export const fetchMedicines = () => api.get('/medicines');
export const fetchMedicineStats = () => api.get('/medicines/stats');
export const addMedicine = (medicineData) => api.post('/medicines', medicineData);
export const updateMedicine = (id, medicineData) => api.put(`/medicines/${id}`, medicineData);
export const deleteMedicine = (id) => api.delete(`/medicines/${id}`);
