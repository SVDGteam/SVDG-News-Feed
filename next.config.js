/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/dispatch',
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
}

module.exports = nextConfig
