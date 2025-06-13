import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'openstreetmap-tiles',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
}

export default withPWA(nextConfig);
