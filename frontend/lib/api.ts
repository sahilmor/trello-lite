import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Use the port you fixed earlier (5001)
});

// Add a request interceptor to attach the Token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;