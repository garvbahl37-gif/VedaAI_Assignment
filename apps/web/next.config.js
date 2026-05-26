/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@vedaai/shared'],
  experimental: {
    typedRoutes: false,
  },
};

module.exports = nextConfig;
