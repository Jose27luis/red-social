import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    // Security headers configuration - mirrors backend Helmet.js setup
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Content Security Policy - strict in production, relaxed in development
    const contentSecurityPolicy = isDevelopment
      ? [] // Disabled in development for hot-reload and dev tools
      : [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval for hydration
              "style-src 'self' 'unsafe-inline'", // Tailwind CSS requires unsafe-inline
              "img-src 'self' data: https: blob:",
              `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'} ${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}`,
              "font-src 'self' data:",
              "object-src 'none'",
              "media-src 'self'",
              "frame-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ];

    return [
      {
        source: '/(.*)',
        headers: [
          // 1. Content Security Policy
          ...contentSecurityPolicy,

          // 2. X-DNS-Prefetch-Control - Disable DNS prefetching
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off'
          },

          // 3. X-Frame-Options - Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },

          // 4. Strict-Transport-Security (HSTS) - Force HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },

          // 5. X-Content-Type-Options - Prevent MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },

          // 6. Referrer-Policy - Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'no-referrer'
          },

          // 7. Permissions-Policy - Disable unnecessary browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },

          // 8. X-XSS-Protection - Legacy XSS protection for older browsers
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },

          // 9. Cross-Origin-Embedder-Policy
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none' // Relaxed for API compatibility
          },

          // 10. Cross-Origin-Opener-Policy
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          },

          // 11. Cross-Origin-Resource-Policy
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin' // Allow resources from backend API
          },

          // 12. Origin-Agent-Cluster
          {
            key: 'Origin-Agent-Cluster',
            value: '?1'
          },

          // 13. X-Permitted-Cross-Domain-Policies
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none'
          },

          // 14. Hide Next.js powered-by header (already hidden by default, but explicitly removed)
          // This prevents technology fingerprinting
        ]
      }
    ];
  },

  // Disable X-Powered-By header
  poweredByHeader: false,

  // Enable standalone output for Docker optimization
  output: 'standalone',

  // Configure remote images
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
