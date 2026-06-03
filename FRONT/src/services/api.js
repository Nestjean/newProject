// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response success: ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error('[API] Response error:', error.response?.data || error.message);
    
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('⚠️ Impossible de se connecter au serveur');
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default api;