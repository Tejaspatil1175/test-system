import axios from 'axios';

const baseURL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ||
  'http://localhost:5000/api';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional auto cleanup on expired token
      const isAuthRequest = error.config && error.config.url && error.config.url.includes('/auth/');
      if (!isAuthRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('teamName');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
