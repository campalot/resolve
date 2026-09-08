import axios from 'axios';
import { useAppStore } from '../store/useAppStore';

// Safe environment sniff for Vitest or Vite test mode
const isTest = import.meta.env.MODE === 'test' || (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.VITEST);

export const api = axios.create({
  // Use absolute URL for Node/Vitest, and for Browser, since incorporating real backend
  baseURL: 'http://localhost:3001/api',
  // CRUCIAL: This forces the browser to send cookies with every request
  withCredentials: true, 
  paramsSerializer: {
    indexes: null, // Global fix for all the filter objects. This prevents the [] brackets in the URL
  },
  // THIS IS THE KEY: Force fetch for MSW 2.0+ compatibility in Node
  adapter: isTest ? 'fetch' : undefined, 
});

// AUTO-BADGING: Add the strategy=REST param to every call automatically
api.interceptors.request.use((config) => {
  const currentRole = useAppStore.getState().activeRole;
  
  config.params = {
    ...config.params,
    role: currentRole,
    strategy: 'REST',
  };

  // SIGNAL BREAK: Pass test status directly to the separate backend process
  if (isTest) {
    config.headers = config.headers || {};
    config.headers['x-resolve-test-context'] = 'true';
    
    // Explicitly target your isolated test automation passport session
    config.headers['x-resolve-session-id'] = 'demo-session-test-automation-passport';
  }

  return config;
});