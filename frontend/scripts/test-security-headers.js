/**
 * Security Headers Validation Script
 *
 * This script validates that all 14 security headers are properly configured
 * in the Next.js application. Run this after starting the development server.
 *
 * Usage:
 *   1. Start the dev server: npm run dev
 *   2. In another terminal: node scripts/test-security-headers.js
 */

const http = require('http');

const SERVER_URL = 'http://localhost:3002';

// Expected headers and their values
const EXPECTED_HEADERS = {
  'x-dns-prefetch-control': 'off',
  'x-frame-options': 'DENY',
  'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'x-xss-protection': '1; mode=block',
  'cross-origin-embedder-policy': 'unsafe-none',
  'cross-origin-opener-policy': 'same-origin-allow-popups',
  'cross-origin-resource-policy': 'cross-origin',
  'origin-agent-cluster': '?1',
  'x-permitted-cross-domain-policies': 'none',
};

// Headers that should NOT be present
const FORBIDDEN_HEADERS = ['x-powered-by'];

// CSP is conditional (only in production)
const CSP_HEADER = 'content-security-policy';

console.log('🔒 Security Headers Validation');
console.log('================================\n');
console.log(`Testing: ${SERVER_URL}\n`);

http.get(SERVER_URL, (res) => {
  const headers = res.headers;
  let passedCount = 0;
  let failedCount = 0;
  let warningCount = 0;

  console.log('📋 Header Checks:\n');

  // Check expected headers
  Object.entries(EXPECTED_HEADERS).forEach(([headerName, expectedValue]) => {
    const actualValue = headers[headerName];

    if (actualValue) {
      if (actualValue === expectedValue) {
        console.log(`✅ ${headerName}: ${actualValue}`);
        passedCount++;
      } else {
        console.log(`⚠️  ${headerName}: Expected "${expectedValue}", got "${actualValue}"`);
        warningCount++;
      }
    } else {
      console.log(`❌ ${headerName}: MISSING`);
      failedCount++;
    }
  });

  // Check Content-Security-Policy (conditional)
  if (headers[CSP_HEADER]) {
    console.log(`✅ ${CSP_HEADER}: ${headers[CSP_HEADER].substring(0, 50)}... (CONFIGURED)`);
    passedCount++;
  } else {
    console.log(`⚠️  ${CSP_HEADER}: Not present (OK in development, REQUIRED in production)`);
    warningCount++;
  }

  // Check forbidden headers
  console.log('\n🚫 Forbidden Headers Check:\n');

  FORBIDDEN_HEADERS.forEach((headerName) => {
    if (headers[headerName]) {
      console.log(`❌ ${headerName}: PRESENT (should be hidden)`);
      failedCount++;
    } else {
      console.log(`✅ ${headerName}: Not present (correctly hidden)`);
      passedCount++;
    }
  });

  // Summary
  console.log('\n================================');
  console.log('📊 Summary:');
  console.log(`   ✅ Passed: ${passedCount}`);
  console.log(`   ⚠️  Warnings: ${warningCount}`);
  console.log(`   ❌ Failed: ${failedCount}`);
  console.log('================================\n');

  if (failedCount === 0 && warningCount === 0) {
    console.log('🎉 All security headers are properly configured!');
    process.exit(0);
  } else if (failedCount === 0) {
    console.log('⚠️  Security headers are configured but have warnings.');
    console.log('   (Warnings are acceptable in development mode)');
    process.exit(0);
  } else {
    console.log('❌ Some security headers are missing or misconfigured.');
    console.log('   Please review the configuration in next.config.ts');
    process.exit(1);
  }
}).on('error', (err) => {
  console.error('❌ Error connecting to server:', err.message);
  console.error('\n💡 Make sure the development server is running:');
  console.error('   npm run dev');
  process.exit(1);
});
