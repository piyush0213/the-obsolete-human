/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content-Security-Policy (CSP) mitigates Cross-Site Scripting (XSS) and data injection attacks
          // by explicitly defining which dynamic resources are allowed to load.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://images.unsplash.com https://*.unsplash.com",
              "connect-src 'self' https://generativelanguage.googleapis.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // X-Frame-Options prevents clickjacking by ensuring the app cannot be embedded in an iframe.
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // X-Content-Type-Options disables MIME sniffing, forcing browsers to respect the declared Content-Type.
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Referrer-Policy controls how much referrer information is included with requests.
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions-Policy restricts the browser features and APIs that the document can use.
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Strict-Transport-Security enforces HTTPS for future requests to prevent downgrade attacks.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
