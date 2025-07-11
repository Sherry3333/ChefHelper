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

// 如果是登录、注册等特殊接口需要自定义 Authorization，可以保留，否则建议全部依赖 axiosInstance 的拦截器。
