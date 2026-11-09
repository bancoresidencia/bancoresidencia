import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.mercadopago.com https://accounts.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mercadopago.com https://accounts.google.com https://www.googleapis.com https://generativelanguage.googleapis.com",
              "frame-src 'self' https://accounts.google.com https://*.mercadopago.com https://www.mercadopago.com.br",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://accounts.google.com https://www.mercadopago.com.br"
            ].join('; ')
          }
        ]
      }
    ];
  }
};

export default nextConfig;
