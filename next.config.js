/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: ["localhost", "127.0.0.1"],

  // Add security headers
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://pagead2.googlesyndication.com https://adservice.google.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://challenges.cloudflare.com https://ep2.adtrafficquality.google;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://challenges.cloudflare.com;
              img-src 'self' data: blob: https://ep1.adtrafficquality.google;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://*.vercel.app https://www.google-analytics.com https://analytics.google.com https://challenges.cloudflare.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://*.amazonaws.com;
              frame-src 'self' https://challenges.cloudflare.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://ep2.adtrafficquality.google https://google.com https://www.google.com;
            `.replace(/\s{2,}/g, ' ').trim(),
          }
          ,
        ],
      },
    ];
  },
};

module.exports = nextConfig;
