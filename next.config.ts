// next.config.ts
import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV !== 'production';
const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL || '';
type RemotePattern = NonNullable<NonNullable<NextConfig['images']>['remotePatterns']>[number];



let mediaRemotePattern: RemotePattern | null = isDevelopment
  ? {
      protocol: 'http' as const,
      hostname: '127.0.0.1',
      pathname: '/media/**',
    }
  : null;

try {
  const parsedMediaUrl = new URL(mediaUrl || 'http://127.0.0.1:8000/media');
  mediaRemotePattern = {
    protocol: parsedMediaUrl.protocol.replace(':', '') as 'http' | 'https',
    hostname: parsedMediaUrl.hostname,
    pathname: parsedMediaUrl.pathname.endsWith('/')
      ? `${parsedMediaUrl.pathname}**`
      : `${parsedMediaUrl.pathname}/**`,
  };
} catch {
  if (!isDevelopment) {
    throw new Error('NEXT_PUBLIC_MEDIA_URL must be an absolute URL.');
  }
}

const remotePatterns: RemotePattern[] = mediaRemotePattern ? [mediaRemotePattern] : [];

if (isDevelopment) {
  remotePatterns.push(
    {
      protocol: 'http' as const,
      hostname: '127.0.0.1',
      pathname: '/**',
    },
    {
      protocol: 'http' as const,
      hostname: 'localhost',
      pathname: '/**',
    }
  );
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
