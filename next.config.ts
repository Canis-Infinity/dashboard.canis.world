import type { NextConfig } from 'next';

const internalApiBaseUrl = process.env.INTERNAL_API_BASE_URL
  || (process.env.NODE_ENV === 'development' ? 'http://localhost:7344' : 'http://host.docker.internal:7344');

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${internalApiBaseUrl}/api/:path*` },
      { source: '/uploads/:path*', destination: `${internalApiBaseUrl}/uploads/:path*` },
      { source: '/avatar.jpg', destination: `${internalApiBaseUrl}/avatar.jpg` },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  transpilePackages: ['@yaireo/tagify'],
};

export default nextConfig;
