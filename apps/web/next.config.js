/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com', 's3.amazonaws.com'],
  },
  // Support for next-intl
  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;
