export interface AgentStep {
  title: string
  desc: string
}

export interface AgentDocument {
  kind: 'invoice' | 'receipt' | 'payment' | 'photo'
  title: string
  lines: string[]
  status?: { label: string; tone: 'ok' | 'pending' | 'warn' }
}

export interface AgentChatMessage {
  from: 'bot' | 'user'
  text?: string
  document?: AgentDocument
  time?: string
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
      { from: 'bot', text: 'Hola Carlos 👋 Soy el asistente de cobranza de Constructora del Valle.', time: '9:02' },
      {
        from: 'bot',
        time: '9:02',
        document: {
          kind: 'invoice',
          title: 'Factura #4021',
          lines: ['Cliente: Grupo Hidalgo SA', 'Monto: $18,500 MXN', 'Vencida hace 3 días'],
          status: { label: 'Vencida', tone: 'warn' },
        },
      },
      { from: 'bot', text: 'La vi vencida desde el lunes. ¿Todo bien por allá?', time: '9:02' },
      { from: 'user', text: 'Ah discúlpame, se me pasó por completo. La pago mañana sin falta', time: '9:14' },
      { from: 'bot', text: 'No hay problema Carlos 🙌 te dejo el link para que sea más fácil:', time: '9:15' },
      { from: 'bot', text: 'pay.novotech.mx/4021', time: '9:15' },
      { from: 'bot', text: '¿Te marco mañana como a las 5pm nada más para confirmar que ya quedó?', time: '9:15' },
      { from: 'user', text: 'va, así queda', time: '9:16' },
      {
        from: 'bot',
        time: 'vie 5:02',
        document: {
          kind: 'payment',
          title: 'Pago recibido',
          lines: ['Factura #4021', '$18,500 MXN', 'Confirmado por Stripe'],
          status: { label: 'Pagada', tone: 'ok' },
        },
      },
      { from: 'bot', text: '¡Recibido, Carlos! Gracias por la puntualidad 🙌 Nos vemos en la próxima.', time: 'vie 5:03' },
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
      { from: 'bot', text: 'Hola Andrea 😊 Se acaba de liberar un espacio HOY a las 4:30pm con la Dra. Fernanda.', time: '11:20' },
      { from: 'bot', text: 'Sé que habías preguntado si podías adelantar tu cita, ¿te sirve este horario?', time: '11:20' },
      { from: 'user', text: 'Uy sí!! Me sirve perfecto, gracias por avisarme', time: '11:24' },
      {
        from: 'bot',
        time: '11:24',
        document: {
          kind: 'receipt',
          title: 'Cita confirmada',
          lines: ['Dra. Fernanda Ruiz', 'Hoy · 4:30pm', 'Consultorio 3, Piso 2'],
          status: { label: 'Confirmada', tone: 'ok' },
        },
      },
      { from: 'bot', text: 'Quedaste agendada. Te mando recordatorio 1 hora antes 🎉', time: '11:24' },
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
      { from: 'user', text: '📷 [foto de ticket]', time: '2:41' },
      {
        from: 'bot',
        time: '2:42',
        document: {
          kind: 'photo',
          title: 'Ticket detectado',
          lines: ['Office Depot', 'Folio A-4471', '$2,340 MXN + IVA'],
          status: { label: 'Procesando', tone: 'pending' },
        },
      },
      { from: 'bot', text: 'Lo leí: Office Depot, folio A-4471, $2,340 + IVA. Categoría sugerida: Papelería y oficina. ¿Va así?', time: '2:42' },
      { from: 'user', text: 'sí correcto', time: '2:43' },
      {
        from: 'bot',
        time: '2:43',
        document: {
          kind: 'receipt',
          title: 'Gasto clasificado',
          lines: ['Papelería y oficina', '14 facturas este mes', 'Total: $38,900 MXN'],
          status: { label: 'Guardado', tone: 'ok' },
        },
      },
      { from: 'bot', text: 'Guardado ✅ Le mando el corte completo a tu contador el día 28.', time: '2:43' },
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
      { from: 'bot', text: '¡Hola! Vi que te interesó el depa en Polanco 🏙️', time: '6:10' },
      { from: 'bot', text: '¿Lo buscas para vivir o como inversión?', time: '6:10' },
      { from: 'user', text: 'para vivir, con mi familia', time: '6:15' },
      { from: 'bot', text: 'Qué bien. ¿Tienes un presupuesto aproximado y en cuánto tiempo te gustaría mudarte?', time: '6:16' },
      { from: 'user', text: 'como 4.5 millones, en los próximos 2 meses', time: '6:19' },
      {
        from: 'bot',
        time: '6:19',
        document: {
          kind: 'receipt',
          title: 'Lead calificado',
          lines: ['Depa Polanco · Uso: Vivienda', 'Presupuesto: $4.5M MXN', 'Cierre estimado: 2 meses'],
          status: { label: 'Calificado', tone: 'ok' },
        },
      },
      { from: 'bot', text: '¡Perfecto! Ya tengo tu perfil listo. Te conecto con Mariana, asesora de la zona — te contacta hoy mismo 📲', time: '6:20' },
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
      { from: 'bot', text: 'Hola María 👋 Notamos que ya se te debe estar por acabar tu café (tu última compra fue hace 45 días)', time: '10:05' },
      { from: 'bot', text: '¿Te mando tu pedido de siempre?', time: '10:05' },
      { from: 'user', text: 'uy sí, se me había olvidado jaja', time: '10:22' },
      {
        from: 'bot',
        time: '10:23',
        document: {
          kind: 'receipt',
          title: 'Combo favorito',
          lines: ['2x Café molido 500g', '1x Filtros #4', '10% dto. cliente frecuente'],
          status: { label: 'Listo para pagar', tone: 'pending' },
        },
      },
      { from: 'bot', text: 'Jaja pasa mucho 😄 Te dejo el link: tienda.mx/re-14', time: '10:23' },
    ],
  },
]

export function getAgentBySlug(slug: string): Agent | undefined {
  return AGENTS.find((a) => a.slug === slug)
}
