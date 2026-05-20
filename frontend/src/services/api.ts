import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';

// Setup base API URL, defaulting to local port 5000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Mount Bearer authentication header dynamically
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch unauthorized response statuses (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server sends a 401 Unauthorized, automatically sign out user session
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
    }
    
    // Normalize backend error structure
    const serverError = error.response?.data?.error;
    if (serverError) {
      return Promise.reject({
        message: serverError.message || 'An error occurred',
        code: serverError.code || 'API_ERROR',
        statusCode: serverError.statusCode || error.response.status,
        details: serverError.details || null,
      });
    }

    return Promise.reject({
      message: error.message || 'Network error occurred',
      code: 'NETWORK_ERROR',
      statusCode: 500,
    });
  }
);

export default api;
