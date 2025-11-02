/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Remove ignoreBuildErrors to enforce type checking during builds
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
