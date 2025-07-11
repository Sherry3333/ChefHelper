import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // Use environment variable for API URL
});

instance.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error);
  }
);

instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default instance;
