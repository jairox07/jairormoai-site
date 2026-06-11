import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ConstellationCanvas } from '@/components/constellation/ConstellationCanvas'
import { SpaceWaves } from '@/components/constellation/SpaceWaves'
import { ClickRipple } from '@/components/ui/ClickRipple'
import { PageViewTracker } from '@/components/analytics/PageViewTracker'

const OG_IMAGE = 'https://aufounpvgprzciqcswyi.supabase.co/storage/v1/object/sign/jairoromo.ai%20bucket/aragonai-7984aeb5-3408-4714-bbc3-f21c8bb0dd2f.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wY2EyZWRmZC03MzZiLTRkNWItOGY5OS1jNjNiMzFmMjQzMmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJqYWlyb3JvbW8uYWkgYnVja2V0L2FyYWdvbmFpLTc5ODRhZWI1LTM0MDgtNDcxNC1iYmMzLWYyMWM4YmIwZGQyZi5qcGVnIiwiaWF0IjoxNzgwNjEwNzAxLCJleHAiOjE4MTIxNDY3MDF9.tIzFipsnTXhr4EvUFkW3_a8Qh6byTAkwBnS20ZfhvmY'

export const metadata: Metadata = {
  title: {
    default: 'Jairo Romo — Consultor de IA en Español | jairoromo.ai',
    template: '%s | jairoromo.ai',
  },
  description: 'Jairo Romo: consultor, builder y speaker de Inteligencia Artificial en español. Claude, GPT, Gemini, RAG, Agentes IA. Sesiones 1:1, cursos y recursos para profesionales en México y LATAM.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://jairoromo.ai'),
  alternates: {
    canonical: 'https://jairoromo.ai',
  },
  keywords: [
    'consultor inteligencia artificial',
    'IA en español',
    'Claude AI México',
    'cursos IA LATAM',
    'automatización con IA',
    'prompts Claude',
    'agentes IA',
    'RAG español',
    'Jairo Romo',
    'jairoromo.ai',
    'IA para abogados',
    'IA para inmobiliaria',
  ],
  authors: [{ name: 'Jairo Romo', url: 'https://jairoromo.ai' }],
  creator: 'Jairo Romo',
  publisher: 'jairoromo.ai',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Jairo Romo — Consultor de IA en Español',
    description: 'Consultor de IA en México. Claude, GPT, Gemini, RAG, Agentes. Sesiones 1:1, cursos y recursos para profesionales que quieren aplicar IA sin fricción.',
    url: 'https://jairoromo.ai',
    siteName: 'jairoromo.ai',
    locale: 'es_MX',
    type: 'website',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Jairo Romo — Consultor de Inteligencia Artificial en español',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@jairoromo_ai',
    creator: '@jairoromo_ai',
    title: 'Jairo Romo — Consultor de IA en Español',
    description: 'IA aplicada al mundo real en español. Sesiones 1:1, cursos y recursos para profesionales.',
    images: [OG_IMAGE],
  },
  verification: {
    // Add Google Search Console verification token here when available
    // google: 'your-token',
  },
}

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Jairo Romo',
  url: 'https://jairoromo.ai',
  image: 'https://jairoromo.ai/jairo-photo.png',
  jobTitle: 'Consultor de Inteligencia Artificial',
  description: 'Consultor, builder y speaker de IA en español. Especialista en Claude, GPT, Gemini, RAG y Agentes IA para profesionales en México y LATAM.',
  knowsAbout: [
    'Inteligencia Artificial',
    'Large Language Models',
    'Claude AI',
    'GPT-4',
    'Gemini',
    'RAG (Retrieval-Augmented Generation)',
    'Agentes IA',
    'Automatización con IA',
    'Prompts en español',
    'IA para negocios',
  ],
  sameAs: [
    'https://tiktok.com/@jairoromo.ai',
    'https://instagram.com/jairoromo.ai',
    'https://youtube.com/@jairoromo.ai',
    'https://github.com/jairoromo',
  ],
  worksFor: {
    '@type': 'Organization',
    name: 'jairoromo.ai',
    url: 'https://jairoromo.ai',
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'MX',
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'jairoromo.ai',
  url: 'https://jairoromo.ai',
  description: 'Sitio oficial de Jairo Romo — Consultor de IA en español para profesionales en México y LATAM.',
  author: { '@type': 'Person', name: 'Jairo Romo' },
  inLanguage: 'es-MX',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://jairoromo.ai/vault?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen bg-bg text-white font-sora antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TSVBK4TN35"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TSVBK4TN35');
          `}
        </Script>
        <PageViewTracker />
        <SpaceWaves />
        <ConstellationCanvas />
        <ClickRipple />
        {/* Ambient orbs */}
        <div className="fixed top-[-150px] left-[-150px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(79,195,247,0.07),transparent_70%)] pointer-events-none z-[1]" />
        <div className="fixed bottom-[-150px] right-[-150px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.06),transparent_70%)] pointer-events-none z-[1]" />
        <div className="relative z-10">
          <Navbar />
          <main className="pt-[67px]">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
