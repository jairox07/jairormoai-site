import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Generador de Contratos Laborales MX — jairoromo.ai',
  description: 'Genera contratos de trabajo conformes a la LFT mexicana. Tiempo indeterminado, determinado, prestación de servicios. Descarga en Word, PDF o TXT. Gratis.',
  keywords: 'contrato laboral México, generador contrato trabajo, LFT 2024, STPS contrato, contrato prestación servicios',
  alternates: { canonical: 'https://jairoromo.ai/vault/proyectos/legal-laboral' },
  openGraph: {
    title: 'Generador de Contratos Laborales MX — jairoromo.ai',
    description: 'Herramienta IA para generar contratos de trabajo conformes a la LFT. Descarga Word o PDF.',
    url: 'https://jairoromo.ai/vault/proyectos/legal-laboral',
    type: 'website',
  },
}

export default function LegalLaboralPage() {
  return (
    <div className="min-h-screen pt-[67px]">
      <div className="border-b border-white/[0.05] bg-bg2/60 backdrop-blur-sm px-6 md:px-12 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs font-mono text-gray2">
          <a href="/vault" className="hover:text-cyan transition-colors">Bóveda IA</a>
          <span>/</span>
          <a href="/vault/proyectos" className="hover:text-cyan transition-colors">Proyectos</a>
          <span>/</span>
          <span className="text-cyan">Contratos Laborales</span>
          <span className="ml-auto flex items-center gap-1.5 text-cyan">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_5px_#4FC3F7] animate-pulse" />
            Herramienta 01 de 06
          </span>
        </div>
      </div>

      <iframe
        src="/tools/legal-mx-01-laboral.html"
        title="Generador de Contratos Laborales México"
        className="w-full border-0"
        style={{ minHeight: 'calc(100vh - 107px)' }}
        allow="downloads"
      />
    </div>
  )
}
