// process.env.VITE_API_URL is replaced at build time by rollup-replace
declare const process: { env: { VITE_API_URL?: string } };
export const API_BASE_URL: string = process.env.VITE_API_URL || 'http://localhost:8080';
