/** @type {import('next').NextConfig} */
const { version } = require('./package.json')

const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: true,
  },
  env: {
    // Baked in at build time so both server and client know the running version.
    NEXT_PUBLIC_APP_VERSION: version,
  },
}

module.exports = nextConfig 