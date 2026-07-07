import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url}`, {
    headers: config.headers,
    data: config.data,
    params: config.params
  });
  return config;
});

export function setApiAuthorizationHeader(token?: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
