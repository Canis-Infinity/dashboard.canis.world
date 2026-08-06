import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '後台｜Canis Den',
    short_name: '後台｜Canis Den',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#141414',
    theme_color: '#141414',
    description: '網站後台',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/favicon.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  };
}
