/**
 * Vitest Setup File
 *
 * This file runs before all tests. It sets up:
 * - Testing Library matchers
 * - MSW (Mock Service Worker) for API mocking
 * - Global test utilities
 * - Environment variables
 */

import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// ==================== Testing Library Setup ====================

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// ==================== MSW Setup ====================

/**
 * Mock Service Worker setup for API mocking
 *
 * Uncomment and configure when you need to mock API requests in tests
 */

// import { setupServer } from 'msw/node';
// import { http, HttpResponse } from 'msw';

// // Define API mocks
// const handlers = [
//   // Auth endpoints
//   http.post('http://localhost:3001/auth/login', () => {
//     return HttpResponse.json({
//       accessToken: 'mock-access-token',
//       refreshToken: 'mock-refresh-token',
//       user: {
//         id: '1',
//         email: 'test@unamad.edu.pe',
//         firstName: 'Test',
//         lastName: 'User',
//       },
//     });
//   }),

//   http.post('http://localhost:3001/auth/register', () => {
//     return HttpResponse.json({
//       id: '1',
//       email: 'test@unamad.edu.pe',
//       firstName: 'Test',
//       lastName: 'User',
//     });
//   }),

//   http.get('http://localhost:3001/auth/me', ({ request }) => {
//     const authHeader = request.headers.get('Authorization');

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return new HttpResponse(null, { status: 401 });
//     }

//     return HttpResponse.json({
//       id: '1',
//       email: 'test@unamad.edu.pe',
//       firstName: 'Test',
//       lastName: 'User',
//     });
//   }),
// ];

// // Create MSW server
// const server = setupServer(...handlers);

// // Start server before all tests
// beforeAll(() => {
//   server.listen({ onUnhandledRequest: 'error' });
// });

// // Reset handlers after each test
// afterEach(() => {
//   server.resetHandlers();
// });

// // Close server after all tests
// afterAll(() => {
//   server.close();
// });

// ==================== Global Test Utilities ====================

/**
 * Wait for a condition to be true
 * Useful for testing async behavior
 */
export async function waitFor(
  condition: () => boolean,
  timeout: number = 5000
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

/**
 * Sleep for a specified amount of time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==================== Mock localStorage ====================

/**
 * Mock localStorage for tests
 */
class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value.toString();
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

global.localStorage = new LocalStorageMock() as Storage;

// ==================== Mock sessionStorage ====================

class SessionStorageMock extends LocalStorageMock {}

global.sessionStorage = new SessionStorageMock() as Storage;

// ==================== Mock matchMedia ====================

/**
 * Mock window.matchMedia for tests
 * Needed for components that use media queries
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // Deprecated
    removeListener: () => {}, // Deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// ==================== Mock IntersectionObserver ====================

/**
 * Mock IntersectionObserver for tests
 * Needed for components that use intersection observers
 */
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
 
} as any;

// ==================== Mock ResizeObserver ====================

/**
 * Mock ResizeObserver for tests
 */
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
 
} as any;

// ==================== Environment Variables ====================

/**
 * Set environment variables for tests
 */
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
process.env.NEXT_PUBLIC_APP_NAME = 'Red Académica UNAMAD';
process.env.NEXT_PUBLIC_UNIVERSIDAD_DOMAIN = '@unamad.edu.pe';
process.env.NODE_ENV = 'test';

// ==================== Console Suppression ====================

/**
 * Suppress console errors/warnings in tests unless they're important
 * This keeps test output clean
 */
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
   
  console.error = (...args: any[]) => {
    // Allow important errors through
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Warning: useLayoutEffect') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

   
  console.warn = (...args: any[]) => {
    // Suppress known warnings
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// ==================== Custom Matchers ====================

/**
 * Add custom matchers for testing
 * These extend vitest's expect function
 */

// Example custom matcher:
// expect.extend({
//   toBeValidEmail(received: string) {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const pass = emailRegex.test(received);

//     return {
//       pass,
//       message: () =>
//         pass
//           ? `expected ${received} not to be a valid email`
//           : `expected ${received} to be a valid email`,
//     };
//   },
// });

// ==================== Global Teardown ====================

/**
 * Clean up after all tests
 */
afterAll(() => {
  // Clear all mocks
  vi.clearAllMocks();

  // Clear localStorage/sessionStorage
  localStorage.clear();
  sessionStorage.clear();
});
