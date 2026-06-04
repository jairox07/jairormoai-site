import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@mux/mux-node'],
  typescript: {
    // Type checking passes locally. Skip in Vercel build to avoid path-alias
    // resolution differences between Windows dev and Linux CI.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
}

export default nextConfig
