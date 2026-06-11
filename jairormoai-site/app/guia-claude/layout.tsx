import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Claude de Cero a Cien — La Guía Más Completa de Claude AI en Español',
  description: 'Guía completa de Claude AI en español. 25 capítulos, 500+ páginas, ejercicios prácticos. Para profesionales, emprendedores y builders que quieren dominar Claude desde cero. $25 USD, un solo pago.',
  alternates: { canonical: 'https://jairoromo.ai/guia-claude' },
  keywords: [
    'guía Claude AI español',
    'curso Claude AI',
    'aprender Claude AI',
    'Claude de cero a cien',
    'Claude AI México',
    'prompts Claude español',
    'Claude Opus Sonnet Haiku',
    'Anthropic Claude guía',
    'inteligencia artificial español',
  ],
  openGraph: {
    title: 'Claude de Cero a Cien — Guía Completa de Claude AI en Español',
    description: '25 capítulos, 500+ páginas, ejercicios prácticos. La guía más completa de Claude AI en español. $25 USD, acceso de por vida.',
    url: 'https://jairoromo.ai/guia-claude',
    type: 'website',
    images: [
      {
        url: 'https://aufounpvgprzciqcswyi.supabase.co/storage/v1/object/sign/jairoromo.ai%20bucket/aragonai-7984aeb5-3408-4714-bbc3-f21c8bb0dd2f.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wY2EyZWRmZC03MzZiLTRkNWItOGY5OS1jNjNiMzFmMjQzMmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJqYWlyb3JvbW8uYWkgYnVja2V0L2FyYWdvbmFpLTc5ODRhZWI1LTM0MDgtNDcxNC1iYmMzLWYyMWM4YmIwZGQyZi5qcGVnIiwiaWF0IjoxNzgwNjEwNzAxLCJleHAiOjE4MTIxNDY3MDF9.tIzFipsnTXhr4EvUFkW3_a8Qh6byTAkwBnS20ZfhvmY',
        width: 1200,
        height: 630,
        alt: 'Claude de Cero a Cien — Guía completa de Claude AI en español',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Claude de Cero a Cien — La guía más completa en español',
    description: '25 capítulos, 500+ páginas. Domina Claude AI desde cero. $25 USD.',
  },
}

export default function GuiaClaudeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
