import { EyebrowPill } from '@/components/ui/EyebrowPill'
import { AuditClient } from './AuditClient'

export const metadata = {
  title: 'Auditoría SEO + GEO gratis — ¿Tu sitio aparece en ChatGPT y Google?',
  description: 'Analiza gratis tu sitio web: posicionamiento en Google (SEO) y en buscadores de IA como ChatGPT, Claude, Perplexity y Gemini (GEO). Recibe el diagnóstico y plan de acción por correo.',
  alternates: { canonical: '/herramientas/auditoria-seo-geo' },
  openGraph: {
    title: 'Auditoría SEO + GEO gratis',
    description: '¿Tu negocio aparece cuando le preguntan a la IA? Diagnóstico completo en segundos.',
    url: '/herramientas/auditoria-seo-geo',
    type: 'website',
  },
}

export default function AuditPage() {
  return (
    <div className="min-h-screen py-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <EyebrowPill live className="mb-6">Herramientas IA</EyebrowPill>
          <h1 className="font-sora font-black text-4xl md:text-5xl mb-5 leading-tight">
            ¿Tu sitio aparece<br />
            <span className="text-cyan">cuando le preguntan a la IA?</span>
          </h1>
          <p className="font-sora text-gray text-lg max-w-2xl">
            Auditoría gratuita de SEO (Google) y GEO (ChatGPT, Claude, Perplexity, Gemini).
            Gratis para cualquiera: ve el diagnóstico al instante, descárgalo en PDF y recíbelo por correo con las siguientes acciones.
          </p>
        </div>
        <AuditClient />
      </div>
    </div>
  )
}
