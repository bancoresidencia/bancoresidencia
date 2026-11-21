import type { NextConfig } from "next";
import { withMotionStudio } from 'motion-studio/next';

const isDev = process.env.NODE_ENV === 'development';
const motionStudioEnabled = isDev && process.env.HIPPOCAMPUS_MOTION_STUDIO === '1';
const motionStudioOrigin = 'http://localhost:5200';

// NOTA: Content-Security-Policy foi migrada para src/middleware.ts com nonces
// por requisição (elimina 'unsafe-inline' em script-src — C-3).
// Esta função é mantida apenas como referência histórica e NÃO é usada.

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  outputFileTracingExcludes: {
    '*': ['./data/**']
  },
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
    // Em produção, ACAO é restrito ao domínio próprio.
    // Em dev, localhost também é aceito.
    // Nota: o CORS dinâmico por Origin é feito no middleware.ts —
    // estes headers são o fallback estático para rotas sem preflight.
    const apiCorsHeaders = [
      {
        key: 'Access-Control-Allow-Origin',
        value: isDev ? 'http://localhost:3000' : 'https://hippocampusresidencia.com.br'
      },
      {
        key: 'Access-Control-Allow-Methods',
        value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
      },
      {
        key: 'Access-Control-Allow-Headers',
        value: 'Content-Type, Authorization, X-Requested-With'
      },
      {
        key: 'Access-Control-Max-Age',
        value: '86400'
      }
    ];

    return [
      {
        // CORS explícito para todas as rotas de API — sobrescreve o wildcard do Vercel CDN
        source: '/api/:path*',
        headers: apiCorsHeaders
      },
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
          // Content-Security-Policy é injetada pelo middleware.ts com nonce por
          // requisição. NÃO definir aqui para evitar que o CDN da Vercel sobrescreva
          // o header dinâmico gerado pelo middleware.
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
