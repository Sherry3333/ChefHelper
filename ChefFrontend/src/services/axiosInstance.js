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

export default instance;
