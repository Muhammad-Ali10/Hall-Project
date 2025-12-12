import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      const isLoginPage = window.location.pathname === '/login' || window.location.pathname.includes('/login');
      
      // Don't redirect or show toast for 401 errors on login page - let the component handle it
      if (error.response.status === 401 && isLoginPage) {
        // Let the login component handle the error display
        return Promise.reject(error);
      }
      
      // For other errors, show toast and handle redirects
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Don't redirect immediately, let the component handle it
        toast.error(message);
      } else {
        toast.error(message);
      }
    } else {
      toast.error('Network error. Please try again.');
    }
    return Promise.reject(error);
  }
);

export default api;

