import { Metadata } from 'next'
import ProjectsClient from './ProjectsClient'

export const metadata: Metadata = {
  title: 'Proyectos IA — Bóveda IA | jairoromo.ai',
  description: 'Herramientas interactivas de IA listas para usar. Stack Legal MX, generadores, calculadoras y más. Construido por jairoromo.ai.',
  keywords: 'herramientas IA México, generador contratos laborales, stack legal IA, jairoromo.ai proyectos',
  alternates: { canonical: 'https://jairoromo.ai/vault/proyectos' },
  openGraph: {
    title: 'Proyectos IA — jairoromo.ai',
    description: 'Herramientas interactivas de IA: Stack Legal MX, generadores y más.',
    url: 'https://jairoromo.ai/vault/proyectos',
    type: 'website',
  },
}

export default function ProyectosPage() {
  return <ProjectsClient />
}
