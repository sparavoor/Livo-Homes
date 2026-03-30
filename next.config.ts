import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'vvlznqrvgjdsnzqtnuid.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'bathoutlet.in' },
      { protocol: 'https', hostname: 'd3hdqda5v86kzc.cloudfront.net' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'lagogroup.in' },
    ],
  },
};

export default nextConfig;
