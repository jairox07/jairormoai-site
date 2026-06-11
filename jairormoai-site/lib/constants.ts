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
    stripeLink: 'https://buy.stripe.com/aFa28s7tH51Xa1H5Cx6wE09',
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
    stripeLink: 'https://buy.stripe.com/14A7sM6pD9id4HnaWR6wE0d',
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
    stripeLink: 'https://buy.stripe.com/eVqcN6cO1fGB7Tzc0V6wE0e',
    calLink: 'https://cal.com/jairoromo/90min',
    popular: false,
  },
] as const

export const GUIA_CLAUDE_STRIPE_LINK = 'https://buy.stripe.com/dRm4gA01fcupa1H6GB6wE0f'

export const HERO_TAGS = ['LLMs', 'RAG', 'Automatización', 'Agentes IA', 'Fine-tuning']

export const VAULT_CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'general', label: 'General' },
  { id: 'claude', label: 'Claude' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'skills', label: 'Skills' },
  { id: 'recursos', label: 'Recursos' },
  { id: 'legal', label: '⚖️ Abogados' },
  { id: 'inmobiliaria', label: '🏡 Inmobiliaria' },
  { id: 'comunidad', label: 'Proyectos Comunidad' },
] as const

// Color per industry/category for vault cards
export const CATEGORY_COLORS: Record<string, {
  badge: string   // bg + text + border for the badge
  card: string    // card border + bg tint
  accent: string  // hex for share icon hover etc.
}> = {
  general:      { badge: 'bg-white/[0.06] border-white/[0.12] text-gray2',  card: 'border-white/[0.07] bg-bg2/40',     accent: '#94A3B8' },
  claude:       { badge: 'bg-cyan/[0.08] border-cyan/[0.18] text-cyan',     card: 'border-cyan/[0.12] bg-cyan/[0.02]', accent: '#4FC3F7' },
  gemini:       { badge: 'bg-[#3B82F6]/[0.08] border-[#3B82F6]/[0.18] text-[#60A5FA]', card: 'border-[#3B82F6]/[0.12] bg-[#3B82F6]/[0.02]', accent: '#60A5FA' },
  skills:       { badge: 'bg-purp/[0.08] border-purp/[0.18] text-purp',    card: 'border-purp/[0.12] bg-purp/[0.02]', accent: '#8B5CF6' },
  recursos:     { badge: 'bg-[#F97316]/[0.08] border-[#F97316]/[0.18] text-[#FB923C]', card: 'border-[#F97316]/[0.12] bg-[#F97316]/[0.02]', accent: '#FB923C' },
  legal:        { badge: 'bg-[#F59E0B]/[0.08] border-[#F59E0B]/[0.18] text-[#FCD34D]', card: 'border-[#F59E0B]/[0.18] bg-[#F59E0B]/[0.03]', accent: '#F59E0B' },
  inmobiliaria: { badge: 'bg-[#10B981]/[0.08] border-[#10B981]/[0.18] text-[#34D399]', card: 'border-[#10B981]/[0.18] bg-[#10B981]/[0.03]', accent: '#10B981' },
  comunidad:    { badge: 'bg-[#EC4899]/[0.08] border-[#EC4899]/[0.18] text-[#F472B6]', card: 'border-[#EC4899]/[0.12] bg-[#EC4899]/[0.02]', accent: '#EC4899' },
  automatizaciones: { badge: 'bg-cyan/[0.08] border-cyan/[0.18] text-cyan', card: 'border-cyan/[0.12] bg-cyan/[0.02]', accent: '#4FC3F7' },
  ml:           { badge: 'bg-purp/[0.08] border-purp/[0.18] text-purp',    card: 'border-purp/[0.12] bg-purp/[0.02]', accent: '#8B5CF6' },
  llms:         { badge: 'bg-[#3B82F6]/[0.08] border-[#3B82F6]/[0.18] text-[#60A5FA]', card: 'border-[#3B82F6]/[0.12] bg-[#3B82F6]/[0.02]', accent: '#60A5FA' },
  rags:         { badge: 'bg-[#F97316]/[0.08] border-[#F97316]/[0.18] text-[#FB923C]', card: 'border-[#F97316]/[0.12] bg-[#F97316]/[0.02]', accent: '#FB923C' },
}
