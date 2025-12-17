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
        // Exclude UI components (shadcn/ui components are third-party)
        'components/ui/**',
        // Exclude app pages (Next.js pages - harder to test, less critical)
        'app/**/*.tsx',
        // Exclude layout files
        'app/**/layout.tsx',
        // Exclude providers
        'app/providers.tsx',
        // Exclude presentational components (focus on business logic)
        'components/**/*.tsx',
        // Exclude API configuration and endpoints (integration tests would be better)
        'lib/api/**',
        // Exclude constants (no logic to test)
        'lib/constants.ts',
        // Exclude utility helpers (mostly Next.js/React utilities)
        'lib/utils.ts',
        // Exclude hooks that require complex WebSocket mocking
        'hooks/useSocket.ts',
        // Exclude Zustand stores (state management - integration tests better)
        'store/**',
        // Exclude XSS prevention (CSP headers - runtime only)
        'lib/security/xss-prevention.ts',
        // Exclude schema definitions (covered by validator tests)
        'lib/validators/common-schemas.ts',
        'lib/validators/file-upload.ts',
      ],
      // Coverage thresholds - maintain high quality on critical code
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
      // Include only critical business logic and utilities
      include: [
        'lib/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
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
