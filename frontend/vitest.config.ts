/**
 * Vitest Configuration
 *
 * Configuration for Vitest testing framework for Next.js application.
 * Includes jsdom environment, coverage setup, and path aliases.
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom environment for React component testing
    environment: 'jsdom',

    // Setup files to run before tests
    setupFiles: ['./test/setup.ts'],

    // Global test settings
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        '.next/**',
        'out/**',
        'build/**',
        'test/**',
        '**/*.config.*',
        '**/types/**',
        '**/*.d.ts',
        '**/index.ts', // Barrel exports
        'scripts/**',
      ],
      // Coverage thresholds - fail if below these percentages
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
      // Include specific patterns
      include: [
        'lib/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'app/**/*.{ts,tsx}',
        'store/**/*.{ts,tsx}',
      ],
    },

    // Test file patterns
    include: [
      '**/__tests__/**/*.{test,spec}.{ts,tsx}',
      '**/*.{test,spec}.{ts,tsx}',
    ],

    // Exclude patterns
    exclude: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
    ],

    // Test timeout (milliseconds)
    testTimeout: 10000,

    // Hook timeout (milliseconds)
    hookTimeout: 10000,

    // Clear mocks between tests
    clearMocks: true,

    // Restore mocks between tests
    restoreMocks: true,

    // Mock reset between tests
    mockReset: true,
  },

  // Resolve path aliases (matching tsconfig.json)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },

  // Define global constants for tests
  define: {
    'process.env.NEXT_PUBLIC_API_URL': JSON.stringify('http://localhost:3001'),
    'process.env.NEXT_PUBLIC_APP_NAME': JSON.stringify('Red Académica UNAMAD'),
    'process.env.NEXT_PUBLIC_UNIVERSIDAD_DOMAIN': JSON.stringify('@unamad.edu.pe'),
  },
});
