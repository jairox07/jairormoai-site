import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/api/'],
      },
      // Allow major AI crawlers explicitly
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/api/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/api/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/api/'],
      },
    ],
    sitemap: 'https://jairoromo.ai/sitemap.xml',
  }
}
