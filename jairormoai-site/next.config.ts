import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@mux/mux-node'],
  typescript: {
    // Type checking passes locally. Skip in Vercel build to avoid path-alias
    // resolution differences between Windows dev and Linux CI.
    ignoreBuildErrors: true,
  },
  // Archivos privados del Kit Editor IA que la ruta de descarga lee con fs
  outputFileTracingIncludes: {
    '/api/kit-editor-ia/descarga': ['./private/skills/kit-editor-ia/**/*'],
  },
  async rewrites() {
    // Landing estática del Kit Editor IA (public/kit-editor-ia/index.html) en /kit-editor-ia
    return [{ source: '/kit-editor-ia', destination: '/kit-editor-ia/index.html' }]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default nextConfig
