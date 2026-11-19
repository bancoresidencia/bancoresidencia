import type { NextConfig } from "next";
import { withMotionStudio } from 'motion-studio/next';

const isDev = process.env.NODE_ENV === 'development';
const motionStudioEnabled = isDev && process.env.HIPPOCAMPUS_MOTION_STUDIO === '1';
const motionStudioOrigin = 'http://localhost:5200';

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  async rewrites() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return [];
    const base = supabaseUrl.replace(/\/$/, '');
    return [
      {
        source: '/storage/questoes/:path*',
        destination: `${base}/storage/v1/object/public/questoes/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      { source: '/questions', destination: '/questoes', permanent: true },
      { source: '/banco', destination: '/questoes', permanent: true },
      { source: '/stats', destination: '/desempenho', permanent: true },
      { source: '/home', destination: '/dashboard', permanent: true },
      { source: '/settings', destination: '/configuracoes', permanent: true },
      { source: '/exams', destination: '/provas', permanent: true },
      { source: '/curadoria', destination: '/admin/curadoria', permanent: true },
      { source: '/reportes', destination: '/admin/reportes', permanent: true },
      { source: '/medevo', destination: '/admin/medevo', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/models/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/simulado-priapismo',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400'
          }
        ]
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://sdk.mercadopago.com https://accounts.google.com`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https://fonts.gstatic.com",
              `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mercadopago.com https://accounts.google.com https://www.googleapis.com wss: ws:${motionStudioEnabled ? ` ${motionStudioOrigin} ws://localhost:5200` : ''}`,
              "frame-src 'self' https://accounts.google.com https://*.mercadopago.com https://www.mercadopago.com.br",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://accounts.google.com https://www.mercadopago.com.br"
            ].join('; ')
          }
        ]
      },
      {
        source: '/auth/confirm',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store' },
          { key: 'Referrer-Policy', value: 'strict-origin' }
        ]
      }
    ];
  }
};

export default motionStudioEnabled
  ? withMotionStudio(nextConfig as unknown as Parameters<typeof withMotionStudio>[0], {
      serverUrl: motionStudioOrigin
    })
  : nextConfig;
