import axios from 'axios';
import { API_BASE_URL } from '../config';
import { authLib } from '../lib/auth';

export const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiInstance.interceptors.request.use((config) => {
  const token = authLib.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authLib.removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
