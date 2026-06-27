import axios from 'axios';

const isTest = import.meta.env.MODE === 'test';

export const api = axios.create({
  // Use absolute URL for Node/Vitest, relative for Browser
  baseURL: isTest ? 'http://localhost:3000/api' : '/api',
  paramsSerializer: {
    indexes: null, // Global fix for all the filter objects. This prevents the [] brackets in the URL
  },
  // THIS IS THE KEY: Force fetch for MSW 2.0+ compatibility in Node
  adapter: isTest ? 'fetch' : undefined, 
});

// AUTO-BADGING: Add the strategy=REST param to every call automatically
api.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    strategy: 'REST',
  };
  return config;
});