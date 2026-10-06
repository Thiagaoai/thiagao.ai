import type { NextConfig } from "next";
import { execSync } from "node:child_process";

// Stamped into the footer and /api/health so anyone can tell which build a
// browser is showing. GIT_SHA comes from the GitHub Actions image build; a
// local build asks git; the Docker context has no .git, so the time alone
// still identifies the build.
function buildStamp() {
  const when = `${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`;
  let sha = process.env.GIT_SHA?.slice(0, 7);
  if (!sha) {
    try {
      sha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    } catch {
      sha = undefined;
    }
  }
  return sha ? `${sha} · ${when}` : when;
}

// `next dev` runs on plain http://localhost. Safari applies upgrade-insecure-requests
// and HSTS even there, so CSS/JS would be requested over https and fail to load.
// Development gets the same policy minus those https-only rules.
const isDev = process.env.NODE_ENV === 'development';

const securityHeaders = [
  ...(isDev
    ? []
    : [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]),
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), accelerometer=(), gyroscope=(), magnetometer=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      // React needs eval() for dev tooling only; production stays without 'unsafe-eval'.
      isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://res.cloudinary.com https://d8j0ntlcm91z4.cloudfront.net https://i.scdn.co",
      "font-src 'self' data:",
      "media-src 'self' https://res.cloudinary.com https://d8j0ntlcm91z4.cloudfront.net",
      "frame-src https://open.spotify.com",
      // Dev hot reload uses a WebSocket; older Safari does not treat ws: as 'self'.
      isDev ? "connect-src 'self' ws://localhost:* https://www.thiagao.io https://thiagao.io" : "connect-src 'self' https://www.thiagao.io https://thiagao.io",
      isDev ? null : "upgrade-insecure-requests",
    ]
      .filter(Boolean)
      .join('; '),
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_BUILD_STAMP: buildStamp(),
  },
  // Lets `FARMZ3D_HOSTS=farmz3d.localhost npm run farmz3d:local` preview the store domain in dev.
  allowedDevOrigins: ['farmz3d.localhost'],
  reactCompiler: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        // Farmz3D product imagery generated with Higgsfield.
        protocol: 'https',
        hostname: 'd8j0ntlcm91z4.cloudfront.net',
        pathname: '/user_3C3uSI3vU6b29vcS2xQJeq4dOn8/**',
      },
    ],
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  async redirects() {
    return [
      // The home used to live at /rebrand-preview; the newsletter had a misspelled twin.
      { source: '/rebrand-preview', destination: '/', permanent: true },
      { source: '/newslatter', destination: '/newsletter', permanent: true },
      { source: '/newslatter/obrigado', destination: '/newsletter/obrigado', permanent: true },
    ];
  },
  async rewrites() {
    return {
      // The home is the standalone Thiagao Ai landing in public/kernelcode. The URL stays "/".
      // beforeFiles so it wins over app/page.tsx; the store domain is already rewritten to
      // /farmz3d by proxy.ts before this runs, so it never reaches this rule.
      beforeFiles: [{ source: '/', destination: '/kernelcode/index.html' }],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Standalone Thiagao Ai landing pages (public/kernelcode) load three.js from jsDelivr and the
        // Schibsted Grotesk font from Google Fonts, so they get a CSP that allows exactly those hosts.
        // Declared after the global rule so this value wins for the same header key.
        source: '/kernelcode/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://d8j0ntlcm91z4.cloudfront.net",
              "font-src 'self' data: https://fonts.gstatic.com",
              "media-src 'self'",
              "connect-src 'self' https://thiagao.io https://www.thiagao.io",
              isDev ? null : 'upgrade-insecure-requests',
            ]
              .filter(Boolean)
              .join('; '),
          },
        ],
      },
      {
        // Same policy for the home, which is rewritten to public/kernelcode/index.html (headers match
        // the incoming path, not the rewrite destination).
        source: '/',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://d8j0ntlcm91z4.cloudfront.net",
              "font-src 'self' data: https://fonts.gstatic.com",
              "media-src 'self'",
              "connect-src 'self' https://thiagao.io https://www.thiagao.io",
              isDev ? null : 'upgrade-insecure-requests',
            ]
              .filter(Boolean)
              .join('; '),
          },
        ],
      },
      {
        // Pages only (anything without a dot, outside /api and /_next). Browsers must
        // revalidate the HTML on every visit: the ISR default (s-maxage with a year of
        // stale-while-revalidate) let Chrome keep showing the previous deploy and only
        // refresh it in the background. The ETag keeps the revalidation a cheap 304.
        source: '/((?!api/|_next/|.*\\..*).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, must-revalidate',
          },
        ],
      },
      {
        source: '/:all*(svg|png|jpg|jpeg|webp|avif|ico|mp4)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Fix connection issues
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
