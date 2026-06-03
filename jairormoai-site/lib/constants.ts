export const SOCIAL_LINKS = [
  { label: 'TikTok', href: 'https://tiktok.com/@jairoromo.ai', icon: 'tiktok' },
  { label: 'Instagram', href: 'https://instagram.com/jairoromo.ai', icon: 'instagram' },
  { label: 'YouTube', href: 'https://youtube.com/@jairoromo.ai', icon: 'youtube' },
  { label: 'GitHub', href: 'https://github.com/jairoromo', icon: 'github' },
] as const

export const HERO_STATS = [
  { value: '50+', label: 'Proyectos IA' },
  { value: '5K+', label: 'Comunidad' },
  { value: '+3000', label: 'Horas probando IAs' },
  { value: 'Desde 2022', label: 'En el campo' },
  { value: '2', label: 'Cursos activos' },
] as const

export const SESSION_PACKAGES = [
  {
    id: 'enfoque-rapido',
    name: 'Enfoque Rápido',
    duration: '20 min',
    price: 15,
    priceCents: 1500,
    currency: 'USD',
    pitch: 'Una pregunta concreta, una respuesta clara. Para desbloquear ese punto donde estás atascado.',
    notFor: 'No apta para estrategia compleja ni múltiples temas.',
    stripePriceId: '',
    calLink: 'https://cal.com/jairoromo/20min',
    popular: false,
  },
  {
    id: 'sesion-trabajo',
    name: 'Sesión de Trabajo',
    duration: '45 min',
    price: 79,
    priceCents: 7900,
    currency: 'USD',
    pitch: 'Revisamos tu proyecto, diagnosticamos el problema y trazamos próximos pasos reales.',
    notFor: 'No apta para rediseños completos de arquitectura.',
    stripePriceId: '',
    calLink: 'https://cal.com/jairoromo/45min',
    popular: true,
  },
  {
    id: 'consultoria-profunda',
    name: 'Consultoría Profunda',
    duration: '90 min',
    price: 297,
    priceCents: 29700,
    currency: 'USD',
    pitch: 'Para proyectos serios. Estrategia de IA aplicada a tu negocio, decisiones de arquitectura, roadmap accionable.',
    notFor: 'No apta para preguntas simples.',
    stripePriceId: '',
    calLink: 'https://cal.com/jairoromo/90min',
    popular: false,
  },
] as const

export const HERO_TAGS = ['LLMs', 'RAG', 'Automatización', 'Agentes IA', 'Fine-tuning']

export const VAULT_CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'automatizaciones', label: 'Automatizaciones' },
  { id: 'ml', label: 'Machine Learning' },
  { id: 'llms', label: 'LLMs' },
  { id: 'rags', label: 'RAGs' },
] as const
