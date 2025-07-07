// frontend/src/api.js

import axios from 'axios';

// Create a centralized Axios instance.
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
export const getMe = () => api.get('/auth/me');

// Medicines
export const fetchMedicines = () => api.get('/medicines');
export const addMedicine = (medicineData) => api.post('/medicines', medicineData);
export const updateMedicine = (id, medicineData) => api.put(`/medicines/${id}`, medicineData);
export const deleteMedicine = (id) => api.delete(`/medicines/${id}`);

// Health Logs (NEW)
export const fetchHealthLogs = () => api.get('/health-logs');
export const addHealthLog = (logData) => api.post('/health-logs', logData);
export const updateHealthLog = (id, logData) => api.put(`/health-logs/${id}`, logData);
export const deleteHealthLog = (id) => api.delete(`/health-logs/${id}`);
