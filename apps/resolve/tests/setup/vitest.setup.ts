import { expect, afterEach, beforeEach } from 'vitest';
import { cleanup, configure } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers'; 
import '@testing-library/jest-dom/vitest'; // Provides the types for Vitest
import { api } from "../../src/api/axiosInstance";
import { client } from "../../src/api/mockApolloClient";

// This bridges the matchers to Vitest's expect
expect.extend(matchers);

configure({ asyncUtilTimeout: 8000 });

global.IntersectionObserver = class IntersectionObserver {
  // Required properties for the interface
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(private callback: IntersectionObserverCallback) {}

  observe() {
    this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }

  takeRecords(): IntersectionObserverEntry[] { return []; }
  unobserve() { return null; }
  disconnect() { return null; }
}; 

// Mock LocalStorage globally so existing getMockDb logic just "works"
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });



beforeEach(async () => {
  try {
    // Hit the real backend reset route. 
    // Axios interceptor automatically adds the 'x-resolve-test-context' header!
    await api.post('/dev/reset');
  } catch (error) {
    console.error("⚠️ Failed to reset mock database on the backend server:", error);
  }
  await client.clearStore();

  localStorage.clear();
});

afterEach(() => {
  cleanup();

  localStorage.clear();
});



