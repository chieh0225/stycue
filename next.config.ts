import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'stycueprodblob.blob.core.windows.net',
      },
    ],
  },
};

export default nextConfig;
