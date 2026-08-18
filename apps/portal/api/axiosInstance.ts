import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  paramsSerializer: {
    indexes: null, // Global fix for all the filter objects. This prevents the [] brackets in the URL
  },
});

// AUTO-BADGING: Add the strategy=REST param to every call automatically
api.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    strategy: 'REST',
  };
  return config;
});