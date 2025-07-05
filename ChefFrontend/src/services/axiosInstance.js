import axios from 'axios';
import { toast } from 'react-toastify';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // Use environment variable for API URL
});

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 402) {
      toast.error('Spoonacular API quota exceeded or payment required.');
    }
    return Promise.reject(error);
  }
);

export default instance;
