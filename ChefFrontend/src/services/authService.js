import axiosInstance from './axiosInstance';

const AUTH_URL = '/auth';
const API_URL = '/user';

export async function register(email, password) {
  const res = await axiosInstance.post(`${AUTH_URL}/register`, { email, password });
  return res.data;
}

export async function login(email, password) {
  const res = await axiosInstance.post(`${AUTH_URL}/login`, { email, password });
  return res.data; // { token }
}

export async function googleLogin(idToken) {
  const res = await axiosInstance.post(`${AUTH_URL}/google`, { idToken });
  return res.data; // { token }
}

export async function getFavorites(token) {
    console.log('getFavorites token:', token);
  const res = await axiosInstance.get(`${API_URL}/favorites`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function addFavorite(recipeId, token) {
  const res = await axiosInstance.post(`${API_URL}/favorites/${recipeId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function removeFavorite(recipeId, token) {
  const res = await axiosInstance.delete(`${API_URL}/favorites/${recipeId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
