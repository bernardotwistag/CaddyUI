/** @type {import('next').NextConfig} */
const { version } = require('./package.json')

const nextConfig = {
  output: 'standalone',
  // Anchor file tracing to this project so a stray parent lockfile can't
  // mis-root the standalone build.
  outputFileTracingRoot: __dirname,
  env: {
    // Baked in at build time so both server and client know the running version.
    NEXT_PUBLIC_APP_VERSION: version,
  },
}

module.exports = nextConfig 