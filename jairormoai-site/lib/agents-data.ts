export interface AgentStep {
  title: string
  desc: string
}

export interface AgentChatMessage {
  from: 'bot' | 'user'
  text: string
  delayMs?: number
}

export interface Agent {
  slug: string
  name: string
  category: string
  icon: string
  roiBadge: string
  shortDesc: string
  problem: string
  savings: string
  steps: AgentStep[]
  chatDemo: AgentChatMessage[]
}

export const AGENTS: Agent[] = [
  {
    slug: 'agente-cobrador-amable',
    name: 'Agente Cobrador Amable',
    category: 'Cuentas por Cobrar & Flujo de Caja',
    icon: '💰',
    roiBadge: 'Reduce cartera vencida hasta 40%',
    shortDesc: 'Da seguimiento a facturas vencidas por WhatsApp con tono cordial, sin desgastar la relación con el cliente.',
    problem: 'Tu equipo pierde horas cada semana llamando a clientes morosos, con resultados inconsistentes y fricción en la relación comercial.',
    savings: 'Ahorra ~15 horas/semana de tu equipo de cobranza y recupera cartera vencida más rápido.',
    steps: [
      { title: 'Conexión', desc: 'Se conecta a tu sistema de facturación (SAT, ERP o Excel) y detecta facturas vencidas automáticamente.' },
      { title: 'IA procesa', desc: 'Envía recordatorios personalizados por WhatsApp con tono cordial, escalando el tono según los días de atraso.' },
      { title: 'Resultados', desc: 'Registra promesas de pago, agenda seguimientos y te notifica cuando un cliente necesita atención humana.' },
    ],
    chatDemo: [
      { from: 'bot', text: 'Hola Carlos 👋 Soy el asistente de Constructora del Valle. Vi que la factura #4021 por $18,500 venció hace 3 días. ¿Todo bien por allá?' },
      { from: 'user', text: 'Ah sí, disculpa, se me pasó. La pago mañana' },
      { from: 'bot', text: 'Perfecto, gracias por avisarme 🙌 Te dejo el link de pago para que sea más fácil: pay.novotech.mx/4021. ¿Te aviso mañana en la tarde para confirmar?' },
      { from: 'user', text: 'Sí, va' },
      { from: 'bot', text: 'Anotado ✅ Quedo pendiente. ¡Que tengas buen día, Carlos!' },
    ],
  },
  {
    slug: 'rescatador-citas-ultimo-minuto',
    name: 'Rescatador de Citas de Último Minuto',
    category: 'Salud, Estética y Consultorios',
    icon: '📅',
    roiBadge: 'Recupera hasta 30% de citas canceladas',
    shortDesc: 'Detecta cancelaciones y huecos en tu agenda, y los llena automáticamente ofreciéndolos a tu lista de espera.',
    problem: 'Cada cancelación de último minuto es un espacio vacío que ya no se recupera — ingresos perdidos y tiempo muerto del personal.',
    savings: 'Recupera en promedio 3-5 citas por semana que antes se perdían por cancelaciones.',
    steps: [
      { title: 'Conexión', desc: 'Se integra a tu calendario (Google Calendar, Calendly o tu sistema de citas) y detecta cancelaciones en tiempo real.' },
      { title: 'IA procesa', desc: 'Identifica pacientes en lista de espera y les ofrece el horario liberado por WhatsApp, priorizando por urgencia.' },
      { title: 'Resultados', desc: 'Confirma la nueva cita automáticamente y actualiza tu calendario sin que muevas un dedo.' },
    ],
    chatDemo: [
      { from: 'bot', text: 'Hola Andrea 😊 Se liberó un espacio HOY a las 4:30pm con la Dra. Fernanda. Sé que querías adelantar tu cita, ¿te sirve este horario?' },
      { from: 'user', text: 'Sí!! Me sirve perfecto' },
      { from: 'bot', text: 'Genial, quedas confirmada para hoy 4:30pm 🎉 Te mando la ubicación y un recordatorio 1 hora antes.' },
    ],
  },
  {
    slug: 'asistente-pre-sat',
    name: 'Asistente Pre-SAT',
    category: 'Recepción y Clasificación de Facturas/Gastos',
    icon: '🧾',
    roiBadge: 'Ahorra hasta 10 horas/mes en captura',
    shortDesc: 'Recibe facturas y comprobantes por WhatsApp, los clasifica y prepara todo listo para tu contador.',
    problem: 'Tu equipo pierde tiempo capturando facturas a mano, clasificando gastos y armando carpetas para el contador cada mes.',
    savings: 'Elimina la captura manual y reduce errores de clasificación antes de llegar a tu contador.',
    steps: [
      { title: 'Conexión', desc: 'Tu equipo envía fotos o PDFs de facturas y tickets directo al WhatsApp del asistente, sin apps nuevas que aprender.' },
      { title: 'IA procesa', desc: 'Extrae folio, RFC, monto, IVA y categoría de gasto automáticamente usando visión por computadora.' },
      { title: 'Resultados', desc: 'Organiza todo en una carpeta mensual lista para tu contador, con reporte de gastos por categoría.' },
    ],
    chatDemo: [
      { from: 'bot', text: '📎 Factura recibida. Detecté: Office Depot, folio A-4471, $2,340 MXN + IVA. Categoría sugerida: Papelería y oficina. ¿Correcto?' },
      { from: 'user', text: 'Sí, correcto' },
      { from: 'bot', text: 'Guardada ✅ Llevas 14 facturas este mes por $38,900. Le mando el corte a tu contador cada día 28.' },
    ],
  },
  {
    slug: 'filtro-calificador-inmobiliario',
    name: 'Filtro Calificador Inmobiliario',
    category: 'Ventas e Inmobiliarias',
    icon: '🏠',
    roiBadge: 'Filtra hasta 60% de leads no calificados',
    shortDesc: 'Conversa con cada prospecto que llega, califica su presupuesto e intención, y solo te pasa los leads listos para cerrar.',
    problem: 'Tu equipo de ventas pierde horas contestando WhatsApp a curiosos, mientras los prospectos serios esperan respuesta y se van con la competencia.',
    savings: 'Libera hasta 20 horas/semana de tu equipo de ventas para enfocarse solo en leads calificados.',
    steps: [
      { title: 'Conexión', desc: 'Se conecta a tus anuncios de Facebook, Instagram y portal inmobiliario — responde cada mensaje al instante.' },
      { title: 'IA procesa', desc: 'Pregunta presupuesto, zona de interés, tiempo de compra y forma de pago, calificando al prospecto en segundos.' },
      { title: 'Resultados', desc: 'Envía a tu vendedor solo los leads calificados con toda la información, agendando la primera llamada.' },
    ],
    chatDemo: [
      { from: 'bot', text: '¡Hola! Vi que te interesó el depa en Polanco 🏙️ ¿Buscas para vivir o inversión?' },
      { from: 'user', text: 'Para vivir, con mi familia' },
      { from: 'bot', text: 'Perfecto. ¿Tienes un presupuesto aproximado y en cuánto tiempo te gustaría mudarte?' },
      { from: 'user', text: 'Como 4.5 millones, en los próximos 2 meses' },
      { from: 'bot', text: '¡Excelente! Ya tengo tu perfil. Te conecto con Mariana, nuestra asesora de la zona — te contacta hoy mismo 📲' },
    ],
  },
  {
    slug: 'reactivador-proactivo-clientes',
    name: 'Reactivador Proactivo de Clientes',
    category: 'E-commerce & Servicios Recurrentes',
    icon: '🔄',
    roiBadge: 'Reactiva hasta 25% de clientes inactivos',
    shortDesc: 'Detecta clientes que dejaron de comprar y los reconecta con ofertas personalizadas antes de que se vayan con la competencia.',
    problem: 'Tienes una base de clientes que ya no te compran y nadie les da seguimiento — ingresos que se quedan sobre la mesa cada mes.',
    savings: 'Genera ventas recurrentes adicionales sin gastar en nueva publicidad, reactivando tu base actual.',
    steps: [
      { title: 'Conexión', desc: 'Se conecta a tu tienda o CRM y detecta clientes que no compran hace 30, 60 o 90 días según tu ciclo.' },
      { title: 'IA procesa', desc: 'Envía un mensaje personalizado por WhatsApp con una oferta relevante basada en su historial de compra.' },
      { title: 'Resultados', desc: 'Genera el link de recompra directo y te avisa cuando el cliente reactiva su compra.' },
    ],
    chatDemo: [
      { from: 'bot', text: 'Hola María 👋 Notamos que ya se te está por acabar tu suministro de café (última compra hace 45 días). ¿Te mando tu pedido de siempre?' },
      { from: 'user', text: 'Uy sí, se me había olvidado jaja' },
      { from: 'bot', text: 'Jaja pasa mucho 😄 Te dejo el link con tu combo favorito + 10% de descuento por ser cliente frecuente: tienda.mx/re-14' },
    ],
  },
]

export function getAgentBySlug(slug: string): Agent | undefined {
  return AGENTS.find((a) => a.slug === slug)
}
