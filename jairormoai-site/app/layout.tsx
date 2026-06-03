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
