import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ConstellationCanvas } from '@/components/constellation/ConstellationCanvas'
import { ClickRipple } from '@/components/ui/ClickRipple'

export const metadata: Metadata = {
  title: 'Jairo Romo — IA sin fricción',
  description: 'Consultor, builder y speaker en Inteligencia Artificial aplicada al mundo real. Sin teoría vacía. Sin promesas falsas.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://jairoromo.ai'),
  openGraph: {
    title: 'Jairo Romo — IA sin fricción',
    description: 'IA aplicada al mundo real. Sesiones 1:1, proyectos y cursos.',
    url: 'https://jairoromo.ai',
    siteName: 'jairoromo.ai',
    locale: 'es_MX',
    type: 'website',
    images: [
      {
        url: 'https://aufounpvgprzciqcswyi.supabase.co/storage/v1/object/sign/jairoromo.ai%20bucket/aragonai-7984aeb5-3408-4714-bbc3-f21c8bb0dd2f.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wY2EyZWRmZC03MzZiLTRkNWItOGY5OS1jNjNiMzFmMjQzMmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJqYWlyb3JvbW8uYWkgYnVja2V0L2FyYWdvbmFpLTc5ODRhZWI1LTM0MDgtNDcxNC1iYmMzLWYyMWM4YmIwZGQyZi5qcGVnIiwiaWF0IjoxNzgwNjEwNzAxLCJleHAiOjE4MTIxNDY3MDF9.tIzFipsnTXhr4EvUFkW3_a8Qh6byTAkwBnS20ZfhvmY',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jairo Romo — IA sin fricción',
    description: 'IA aplicada al mundo real. Sesiones 1:1, proyectos y cursos.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="min-h-screen bg-bg text-white font-sora antialiased">
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
