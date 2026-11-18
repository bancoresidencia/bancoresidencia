import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hippocampus — Residência Médica, Revalida e R+',
    short_name: 'Hippocampus',
    description:
      'Plataforma de preparação de alto rendimento com +200 mil questões comentadas, flashcards FSRS, resumos clínicos e psicometria TRI.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#09090b',
    theme_color: '#09090b',
    categories: ['education', 'medical', 'productivity'],
    lang: 'pt-BR',
    icons: [
      {
        src: '/logo-banco-residencia-120x120.png',
        sizes: '120x120',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/logo-banco-residencia.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any'
      }
    ]
  };
}
