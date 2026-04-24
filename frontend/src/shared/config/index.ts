export const API_BASE_URL =
  (typeof process !== 'undefined' && process.env.VITE_API_URL) ||
  'http://localhost:8080';
