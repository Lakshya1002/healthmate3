// frontend/src/api.js

import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unknown error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// --- Auth ---
export const loginUser = (userData) => api.post('/auth/login', userData);
export const registerUser = (userData) => api.post('/auth/register', userData);
export const getMe = () => api.get('/auth/me');
export const googleLogin = (googleData) => api.post('/auth/google', googleData);
export const requestPasswordReset = (emailData) => api.post('/auth/forgot-password', emailData);
export const resetPassword = (resetData) => api.post('/auth/reset-password', resetData);


// --- Users ---
export const getUserProfile = () => api.get('/users/profile');
export const updateUserProfile = (userData) => api.put('/users/profile', userData);

// --- Medicines ---
export const fetchMedicines = () => api.get('/medicines');
export const fetchMedicineStats = () => api.get('/medicines/stats');
export const addMedicine = (medicineData) => api.post('/medicines', medicineData);
export const updateMedicine = (id, medicineData) => api.put(`/medicines/${id}`, medicineData);
export const deleteMedicine = (id) => api.delete(`/medicines/${id}`);
export const getMedicineSuggestions = (query) => api.get(`/medicines/suggestions?q=${query}`);

// --- Health Logs ---
export const fetchHealthLogs = () => api.get('/health-logs');
export const addHealthLog = (logData) => api.post('/health-logs', logData);
export const updateHealthLog = (id, logData) => api.put(`/health-logs/${id}`, logData);
export const deleteHealthLog = (id) => api.delete(`/health-logs/${id}`);

// --- Reminders ---
export const fetchReminders = () => api.get('/reminders');
export const addReminder = (reminderData) => api.post('/reminders', reminderData);
// ✅ UPDATED: A single function to handle all reminder updates (status, time, medicine, etc.)
export const updateReminder = (id, reminderData) => api.put(`/reminders/${id}`, reminderData);
export const deleteReminder = (id) => api.delete(`/reminders/${id}`);
