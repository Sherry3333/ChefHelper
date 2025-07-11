import { API_BASE_URL } from '../services/axiosInstance';
import chefIcon from '../assets/chef_icon.png';

export function getImageUrl(image) {
  if (!image) return chefIcon; 
  if (image.startsWith('http')) return image;
  return API_BASE_URL + image;
} 