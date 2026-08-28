/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';
const isGithubPagesBuild = process.env.GITHUB_PAGES === 'true';

// CSP is only enabled for production builds — the dev server needs eval for HMR.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Keep Turbopack and output tracing scoped to this project. This avoids Next.js
  // walking up to a parent workspace and accidentally picking another lockfile.
  turbopack: {
    root: process.cwd(),
  },
  outputFileTracingRoot: process.cwd(),
  ...(isGithubPagesBuild ? { output: 'export', trailingSlash: true } : {}),
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  images: {
    formats: ['image/avif', 'image/webp'],
    ...(isGithubPagesBuild ? { unoptimized: true } : {}),
  },
  ...(!isGithubPagesBuild ? {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
            ...(isProd ? [
              { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
              { key: 'Content-Security-Policy', value: csp },
            ] : []),
          ],
        },
      ];
    },
  } : {}),
};

export default nextConfig;
