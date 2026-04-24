import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ThigaoA.i',
    short_name: 'ThigaoA.i',
    description: 'Dev log, automação, agentes de IA, LangGraph, LangSmith, n8n e sites customizados.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#020617',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
