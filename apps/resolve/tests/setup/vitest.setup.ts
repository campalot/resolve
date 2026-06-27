import { expect, afterEach, beforeEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers'; 
import '@testing-library/jest-dom/vitest'; // Provides the types for Vitest
import { resetMockDb } from '../../src/mocks/mockDB';
import { client } from "../../src/api/mockApolloClient";
import { server } from './server';

// This bridges the matchers to Vitest's expect
expect.extend(matchers);

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

// 1. Mock LocalStorage globally so existing getMockDb logic just "works"
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
  resetMockDb();
  await client.clearStore();

  localStorage.clear();
});
beforeAll(() => server.listen({ onUnhandledRequest: 'error' })); // 'error' will tell EXACTLY which URL is failing to match

afterEach(() => {
  cleanup();

  localStorage.clear();
  server.resetHandlers();
});
afterAll(() => server.close());


