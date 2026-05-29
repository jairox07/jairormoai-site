// ─── Tipos base ─────────────────────────────────────────────────

export type Channel = 'whatsapp' | 'instagram' | 'facebook' | 'web' | 'email';
export type Priority = 'urgent' | 'high' | 'normal' | 'low';
export type MsgFrom  = 'lead' | 'ai' | 'human' | 'system';
export type MsgType  = 'text' | 'payment_card' | 'handoff' | 'system' | 'ai_note';

/** Etapa del contacto en el flujo CRM */
export type CRMStage = 'contact' | 'lead' | 'opportunity' | 'customer';

export const CRM_STAGES: Record<CRMStage, { label: string; color: string; soft: string; description: string }> = {
  contact:     { label: 'Contacto',     color: '#71717a', soft: '#f4f4f5', description: 'Solo en la base, sin intención confirmada' },
  lead:        { label: 'Lead',         color: '#605BFF', soft: '#f0efff', description: 'Mostró interés en algún procedimiento' },
  opportunity: { label: 'Oportunidad',  color: '#F59E0B', soft: '#fffbeb', description: 'Tuvo consulta o cotización, en evaluación' },
  customer:    { label: 'Cliente',      color: '#22C55E', soft: '#f0fdf4', description: 'Procedimiento realizado, paciente activo' },
};

export interface Message {
  id?: string;
  from?: MsgFrom;
  type?: MsgType;
  t: string;
  text?: string;
  by?: string;         // author name (human messages)
  // payment_card
  amount?: number;
  concept?: string;
  method?: string;
  status?: 'pending' | 'paid' | 'failed';
  icon?: string;
}

export interface Lead {
  id: string;
  kind: 'lead';
  name: string;
  handle: string;
  channel: Channel;
  column: string;
  score: number;
  intent: string;
  value: number;
  lastSeen: string;
  avatarHue: number;
  assignee: string | null;
  tags: string[];
  movedByAI?: boolean;
  messages: Message[];
  // CRM enrichment
  crmStage?: CRMStage;
  email?: string;
  phone?: string;
  age?: number;
  gender?: 'F' | 'M' | 'Otro';
  city?: string;
  notes?: string;
  lastProcedure?: string;
  nextAppointment?: string;
}

export interface Ticket {
  id: string;
  kind: 'ticket';
  name: string;
  handle: string;
  channel: Channel;
  column: string;
  priority: Priority;
  category: string;
  subject: string;
  sla?: string;
  breached?: boolean;
  lastSeen: string;
  avatarHue: number;
  assignee: string | null;
  tags: string[];
  messages: Message[];
}

export interface KanbanStatus {
  id: string;
  title: string;
  color: string;
  hint: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'agent' | 'viewer';
  avatarHue: number;
  online?: boolean;
}

// ─── Canales ────────────────────────────────────────────────────

export const CHANNELS: Record<Channel, { label: string; short: string; color: string; soft: string }> = {
  whatsapp:  { label: 'WhatsApp Business', short: 'WA',  color: '#25D366', soft: '#e8f9ee' },
  instagram: { label: 'Instagram Direct',  short: 'IG',  color: '#E1306C', soft: '#fdecf3' },
  facebook:  { label: 'Facebook Messenger',short: 'FB',  color: '#0084FF', soft: '#e8f3ff' },
  web:       { label: 'Web Chat Widget',   short: 'Web', color: '#71717a', soft: '#f4f4f5' },
  email:     { label: 'Email',             short: 'Em',  color: '#0ea5e9', soft: '#e0f2fe' },
};

export const PRIORITIES: Record<Priority, { label: string; color: string; soft: string }> = {
  urgent: { label: 'Urgente', color: '#DC2626', soft: '#fee2e2' },
  high:   { label: 'Alta',    color: '#EA580C', soft: '#ffedd5' },
  normal: { label: 'Normal',  color: '#0284C7', soft: '#e0f2fe' },
  low:    { label: 'Baja',    color: '#64748B', soft: '#f1f5f9' },
};

// ─── Statuses Kanban ─────────────────────────────────────────────

export const SALES_STATUSES: KanbanStatus[] = [
  { id: 'new',       title: 'Nuevos Leads',       color: '#a1a1aa', hint: 'Acaban de escribir' },
  { id: 'qualified', title: 'Calificados por IA',  color: '#605BFF', hint: 'Intención confirmada, presupuesto compatible' },
  { id: 'contacted', title: 'Contactado',          color: '#0EA5E9', hint: 'Esperando respuesta del paciente' },
  { id: 'proposal',  title: 'Cotización Enviada',  color: '#8B5CF6', hint: 'Cotización formal entregada' },
  { id: 'scheduled', title: 'Cita Agendada',       color: '#F59E0B', hint: 'Valoración confirmada en calendario' },
  { id: 'won',       title: 'Procedimiento Cerrado', color: '#22C55E', hint: 'Anticipo recibido, fecha quirúrgica separada' },
  { id: 'lost',      title: 'No Interesado',       color: '#EF4444', hint: 'No avanzó por precio, miedo u otro motivo' },
];

export const SUPPORT_STATUSES: KanbanStatus[] = [
  { id: 'new',      title: 'Nuevos',            color: '#a1a1aa', hint: 'Tickets entrantes sin asignar' },
  { id: 'open',     title: 'Abierto',           color: '#0EA5E9', hint: 'Asignados, en investigación' },
  { id: 'pending',  title: 'Esperando cliente', color: '#F59E0B', hint: 'Esperando respuesta o info' },
  { id: 'onhold',   title: 'En espera',         color: '#8B5CF6', hint: 'Pausados por escalamiento' },
  { id: 'resolved', title: 'Resuelto',          color: '#22C55E', hint: 'Solucionados, 24h para reabrir' },
  { id: 'closed',   title: 'Cerrado',           color: '#3F3F46', hint: 'Archivados definitivamente' },
];

// ─── Inventario de medicamentos y consumibles ────────────────────

export type InventoryCategory = 'medicamento' | 'consumible' | 'equipo' | 'implante' | 'producto-venta';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  sku: string;
  stock: number;
  minStock: number;
  unit: string;
  costPrice: number;    // precio de compra
  salePrice: number;    // precio de venta (0 si no se vende por separado)
  supplier?: string;
  expiresAt?: string;   // fecha de caducidad
  location?: string;    // ubicación en almacén
}

export const INVENTORY: InventoryItem[] = [
  // Medicamentos
  { id: 'med-001', name: 'Amoxicilina 500mg c/20', category: 'medicamento', sku: 'MED-AMX-500', stock: 48, minStock: 20, unit: 'caja', costPrice: 85, salePrice: 140, supplier: 'Distribuidora IMEX', expiresAt: '2026-12-01', location: 'Estante A-1' },
  { id: 'med-002', name: 'Ketorolaco 30mg/1ml amp.', category: 'medicamento', sku: 'MED-KET-30', stock: 120, minStock: 50, unit: 'ampolleta', costPrice: 18, salePrice: 35, supplier: 'Distribuidora IMEX', expiresAt: '2026-09-15', location: 'Estante A-2' },
  { id: 'med-003', name: 'Tramadol 50mg c/10 caps', category: 'medicamento', sku: 'MED-TRM-50', stock: 30, minStock: 20, unit: 'caja', costPrice: 95, salePrice: 160, supplier: 'Farmacias del Ahorro', expiresAt: '2027-03-01', location: 'Estante A-3' },
  { id: 'med-004', name: 'Ondansetrón 4mg', category: 'medicamento', sku: 'MED-OND-4', stock: 8, minStock: 15, unit: 'caja', costPrice: 210, salePrice: 320, supplier: 'Distribuidora IMEX', expiresAt: '2026-11-30', location: 'Estante A-4' },
  { id: 'med-005', name: 'Dexametasona 8mg/2ml', category: 'medicamento', sku: 'MED-DEX-8', stock: 60, minStock: 25, unit: 'ampolleta', costPrice: 22, salePrice: 42, supplier: 'Distribuidora IMEX', expiresAt: '2027-01-15', location: 'Estante A-5' },
  { id: 'med-006', name: 'Omeprazol 20mg c/28', category: 'medicamento', sku: 'MED-OME-20', stock: 55, minStock: 20, unit: 'caja', costPrice: 65, salePrice: 110, supplier: 'Farmacias del Ahorro', expiresAt: '2027-06-01', location: 'Estante B-1' },
  { id: 'med-007', name: 'Ciprofloxacino 500mg c/8', category: 'medicamento', sku: 'MED-CIP-500', stock: 22, minStock: 15, unit: 'caja', costPrice: 115, salePrice: 185, supplier: 'Distribuidora IMEX', expiresAt: '2026-10-01', location: 'Estante B-2' },
  { id: 'med-008', name: 'Contractubex gel 30g', category: 'medicamento', sku: 'MED-CTB-30', stock: 18, minStock: 10, unit: 'tubo', costPrice: 180, salePrice: 290, supplier: 'Medi-Pharma', expiresAt: '2027-08-01', location: 'Estante B-3' },
  // Consumibles quirúrgicos
  { id: 'con-001', name: 'Gasa estéril 10x10 c/50', category: 'consumible', sku: 'CON-GSA-10', stock: 200, minStock: 80, unit: 'paquete', costPrice: 35, salePrice: 0, supplier: 'MedSupply MX', location: 'Almacén C-1' },
  { id: 'con-002', name: 'Guantes latex M c/100', category: 'consumible', sku: 'CON-GLT-M', stock: 45, minStock: 20, unit: 'caja', costPrice: 120, salePrice: 0, supplier: 'MedSupply MX', location: 'Almacén C-2' },
  { id: 'con-003', name: 'Faja post-quirúrgica talla M', category: 'consumible', sku: 'CON-FAJ-M', stock: 12, minStock: 8, unit: 'pieza', costPrice: 350, salePrice: 650, supplier: 'Orto-Med', location: 'Almacén D-1' },
  { id: 'con-004', name: 'Faja post-quirúrgica talla L', category: 'consumible', sku: 'CON-FAJ-L', stock: 3, minStock: 8, unit: 'pieza', costPrice: 350, salePrice: 650, supplier: 'Orto-Med', location: 'Almacén D-1' },
  { id: 'con-005', name: 'Lámina de silicón cicatriz 15x10', category: 'consumible', sku: 'CON-SIL-01', stock: 25, minStock: 10, unit: 'pieza', costPrice: 220, salePrice: 380, supplier: 'Medi-Pharma', location: 'Almacén D-2' },
  { id: 'con-006', name: 'Sutura Prolene 3-0 c/12', category: 'consumible', sku: 'CON-PRO-3', stock: 30, minStock: 15, unit: 'caja', costPrice: 480, salePrice: 0, supplier: 'MedSupply MX', location: 'Almacén C-3' },
  // Implantes
  { id: 'imp-001', name: 'Implante Motiva Ergonomix 250cc', category: 'implante', sku: 'IMP-MOT-250', stock: 4, minStock: 2, unit: 'par', costPrice: 18500, salePrice: 0, supplier: 'Motiva MX', location: 'Bodega fría' },
  { id: 'imp-002', name: 'Implante Motiva Ergonomix 300cc', category: 'implante', sku: 'IMP-MOT-300', stock: 6, minStock: 2, unit: 'par', costPrice: 19000, salePrice: 0, supplier: 'Motiva MX', location: 'Bodega fría' },
  { id: 'imp-003', name: 'Implante Mentor 280cc Redondo', category: 'implante', sku: 'IMP-MEN-280', stock: 3, minStock: 2, unit: 'par', costPrice: 16500, salePrice: 0, supplier: 'Mentor MX', location: 'Bodega fría' },
  // Productos de venta
  { id: 'pv-001', name: 'Kit post-quirúrgico básico', category: 'producto-venta', sku: 'PV-KIT-01', stock: 20, minStock: 8, unit: 'kit', costPrice: 850, salePrice: 1500, supplier: 'Interno', location: 'Mostrador' },
  { id: 'pv-002', name: 'Crema hidratante SPF 50 50ml', category: 'producto-venta', sku: 'PV-SPF-50', stock: 35, minStock: 15, unit: 'frasco', costPrice: 280, salePrice: 490, supplier: 'Medi-Pharma', location: 'Mostrador' },
  { id: 'pv-003', name: 'Retinol 0.3% serum 30ml', category: 'producto-venta', sku: 'PV-RET-03', stock: 18, minStock: 10, unit: 'frasco', costPrice: 350, salePrice: 620, supplier: 'Medi-Pharma', location: 'Mostrador' },
  { id: 'pv-004', name: 'Ácido hialurónico oral 120 caps', category: 'producto-venta', sku: 'PV-HA-120', stock: 22, minStock: 10, unit: 'frasco', costPrice: 420, salePrice: 750, supplier: 'Medi-Pharma', location: 'Mostrador' },
];

// ─── Leads (Ventas) — contexto Clínica Bella Forma ───────────────

export const LEADS: Lead[] = [
  {
    id: 'l-000', kind: 'lead', name: 'Alejandra Ruiz', handle: '+52 55 8800 4421',
    channel: 'whatsapp', column: 'scheduled', score: 96, movedByAI: true,
    intent: 'Mamoplastia de aumento · Implantes Motiva', value: 82000,
    lastSeen: 'hace 1 min', avatarHue: 330, assignee: 'sofia-ai',
    crmStage: 'opportunity', email: 'alejandra.ruiz@gmail.com', phone: '+52 55 8800 4421',
    age: 34, gender: 'F', city: 'CDMX', nextAppointment: 'Vie 23 may · 11:00',
    tags: ['hot-lead', 'mama', 'autopilot'],
    messages: [
      { from: 'lead', t: '10:38', text: '¡Hola! Vi su anuncio en Instagram. Me interesa el aumento de busto con implantes, ¿cuánto cuesta?' },
      { from: 'ai',   t: '10:38', text: '¡Hola Alejandra! Con gusto te informo. La mamoplastia de aumento con implantes Motiva va de $65,000 a $95,000 MXN, dependiendo del tamaño y técnica. ¿Te gustaría agendar una valoración gratuita con la Dra. Mondragón?' },
      { from: 'lead', t: '10:40', text: 'Sí me interesa, pero ¿puedo pagar a plazos?' },
      { from: 'ai',   t: '10:40', text: 'Por supuesto. Trabajamos con 3, 6 y 12 meses sin intereses con BBVA y Banamex. También tenemos plan propio: 50% de enganche y el resto en 2 parcialidades. Para apartar tu fecha de consulta solo se requiere un anticipo de $500 MXN.' },
      { from: 'lead', t: '10:41', text: 'Perfecto, ¿me mandas el link de pago?' },
      { type: 'payment_card', t: '10:41', amount: 500, concept: 'Anticipo consulta de valoración · Dra. Mondragón', method: 'Stripe', status: 'paid' },
      { type: 'system', t: '10:43', text: '✅ Anticipo procesado vía Stripe. Lead movido a "Cita Agendada".', icon: 'check-circle' },
      { from: 'ai',   t: '10:43', text: 'Tu anticipo está confirmado. Tu cita con la Dra. Mondragón queda apartada. ¿Te queda mejor viernes a las 11:00 o a las 16:00?' },
      { from: 'lead', t: '10:44', text: 'Viernes a las 11 me sirve' },
      { type: 'handoff', t: '10:45', text: 'Transferido a Agente Humano · Lupita Mora' },
      { type: 'ai_note', t: '10:45', text: 'Resumen de IA: Alejandra (34F, CDMX) interesada en mamoplastia de aumento con Motiva. Anticipo de consulta $500 MXN vía Stripe ✓. Cita agendada viernes 11:00 con Dra. Mondragón. Score IA: 96/100. Presupuesto aproximado: $80,000 MXN. Sugiere 12 MSI.' },
      { from: 'human', t: '10:46', by: 'Lupita Mora', text: '¡Hola Alejandra! Soy Lupita de Clínica Bella Forma. Ya vi tu anticipo, perfecto. Tu cita queda confirmada para el viernes a las 11:00 AM. Te mando ubicación y los documentos a preparar.' },
    ],
  },
  {
    id: 'l-001', kind: 'lead', name: 'Valeria Mendoza', handle: '@vale.mendoza.mx',
    channel: 'instagram', column: 'new', score: 87, crmStage: 'lead',
    intent: 'Rinoplastia · nariz respingada', value: 70000,
    lastSeen: 'hace 2 min', avatarHue: 12, assignee: 'sofia-ai',
    age: 26, gender: 'F', city: 'Guadalajara',
    tags: ['hot-lead', 'rinoplastia'],
    messages: [
      { from: 'lead', t: '10:42', text: 'Hola, quisiera información sobre la rinoplastia para afinar la nariz' },
      { from: 'ai',   t: '10:42', text: '¡Hola Valeria! La rinoplastia es uno de los procedimientos más demandados en la clínica. La Dra. Mondragón se especializa en ella. ¿Tu interés es estético, funcional (problema para respirar) o ambos?' },
      { from: 'lead', t: '10:43', text: 'Solo estético, quiero que quede más respingada y afinar la punta' },
      { from: 'ai',   t: '10:43', text: 'Perfecto. Para ese tipo de resultado se usa técnica de punta de nariz con cartílago propio. El rango de precio es $55,000–$85,000 MXN. La consulta de valoración es gratuita. ¿Vienes a CDMX o prefieres consulta virtual primero?' },
      { from: 'lead', t: '10:44', text: 'Puedo ir a CDMX, ¿cuándo tienen citas?' },
    ],
  },
  {
    id: 'l-002', kind: 'lead', name: 'Carlos Vega', handle: '+52 33 1284 0091',
    channel: 'whatsapp', column: 'new', score: 64, crmStage: 'lead',
    intent: 'Ginecomastia · cirugía pecho masculino', value: 55000,
    lastSeen: 'hace 8 min', avatarHue: 200, assignee: 'sofia-ai',
    age: 29, gender: 'M', city: 'CDMX',
    tags: ['ginecomastia', 'masculino'],
    messages: [
      { from: 'lead', t: '10:30', text: 'Hola, tengo una pregunta medio delicada... ¿operan ginecomastia?' },
      { from: 'ai',   t: '10:30', text: 'Hola Carlos, claro que sí, es un procedimiento frecuente. La ginecomastia (tejido mamario en hombres) tiene solución quirúrgica definitiva. El Dr. Ríos Navarro la realiza con regularidad. ¿Tienes alguna duda específica sobre el proceso?' },
      { from: 'lead', t: '10:35', text: '¿Cuánto cuesta aproximado y cuánto tiempo de recuperación?' },
      { from: 'ai',   t: '10:35', text: 'El costo estimado es $45,000–$65,000 MXN según la cantidad de tejido. La recuperación es de 1–2 semanas para trabajo de oficina y 4 semanas para ejercicio. Usarás una faja de compresión por 4 semanas. ¿Agendamos valoración?' },
    ],
  },
  {
    id: 'l-003', kind: 'lead', name: 'Patricia Solís', handle: '+52 55 1284 5522',
    channel: 'web', column: 'qualified', score: 41, crmStage: 'opportunity',
    intent: 'Abdominoplastia + Liposucción · post-embarazo', value: 120000,
    lastSeen: 'hace 14 min', avatarHue: 280, assignee: 'sofia-ai',
    age: 38, gender: 'F', city: 'CDMX',
    tags: ['mommy-makeover', 'post-embarazo'],
    messages: [
      { from: 'lead', t: '10:18', text: 'Hola, ya tuve mis dos hijos y me gustaría recuperar mi figura, tengo la barriga flácida' },
      { from: 'ai',   t: '10:18', text: '¡Hola Patricia! Lo que describes es muy frecuente post-embarazo. El Mommy Makeover (abdominoplastia + liposucción) es la solución ideal. ¿Ya terminaste la lactancia? Eso es importante antes de proceder.' },
      { from: 'lead', t: '10:19', text: 'Sí, hace 8 meses que terminé de dar pecho' },
      { from: 'ai',   t: '10:19', text: 'Perfecto. El tiempo es ideal. El resultado combina aplanamiento del abdomen, reparación de músculos y definición de cintura. ¿Te agendamos una valoración gratuita con el Dr. Ríos?' },
    ],
  },
  {
    id: 'l-004', kind: 'lead', name: 'Diego Morales', handle: '@diegomx',
    channel: 'whatsapp', column: 'qualified', score: 92, crmStage: 'opportunity',
    intent: 'Botox + Ácido Hialurónico · arrugas nasogenianas', value: 14000,
    lastSeen: 'hace 22 min', avatarHue: 140, assignee: 'sofia-ai',
    age: 42, gender: 'M', city: 'CDMX',
    tags: ['medicina-estetica', 'botox'],
    messages: [
      { from: 'lead', t: '09:58', text: 'Buenos días, me recomendaron su clínica para botox y relleno. ¿Atienden hombres?' },
      { from: 'ai',   t: '09:58', text: 'Buenos días Diego. Por supuesto, el 20% de nuestros pacientes son hombres. El Dr. Sergio Vargas es especialista en medicina estética masculina — siempre con resultados naturales. ¿En qué zonas te interesa trabajar?' },
      { from: 'lead', t: '10:01', text: 'Las arrugas de aquí abajo de los ojos y las líneas de la sonrisa' },
      { from: 'ai',   t: '10:01', text: 'Perfecto. Para esas zonas se usa ácido hialurónico (ojeras y surcos) y opcionalmente botox preventivo. El costo aproximado es $9,000–$14,000 MXN según lo que indique el médico. ¿Cuándo tienes disponibilidad?' },
      { from: 'lead', t: '10:03', text: 'Esta semana o la siguiente me sirve cualquier día' },
    ],
  },
  {
    id: 'l-005', kind: 'lead', name: 'Sofía Ramírez', handle: '@sofiarm_cdmx',
    channel: 'instagram', column: 'won', score: 100, crmStage: 'customer',
    intent: 'Bichectomía · ya realizada', value: 24000,
    lastSeen: 'hace 35 min', avatarHue: 180, assignee: 'lupita',
    age: 28, gender: 'F', city: 'CDMX', lastProcedure: 'Bichectomía · 10 may 2026',
    tags: ['cliente-activo', 'bichectomia', 'seguimiento'],
    messages: [
      { from: 'lead', t: '09:45', text: 'Hola, ya pasé la semana de la cirugía, tengo un poco de inflamación ¿es normal?' },
      { from: 'ai',   t: '09:45', text: '¡Hola Sofía! Sí, la inflamación en los primeros 7–14 días es completamente normal después de bichectomía. Te recomiendo frío local 15 min cada 2h, evitar masticar cosas duras y dormir con la cabeza elevada. ¿Tienes dolor intenso o fiebre?' },
      { from: 'lead', t: '09:47', text: 'No, solo un poco de hinchazón, todo bien' },
      { from: 'ai',   t: '09:47', text: 'Perfecto, eso es buena señal. Tu cita de revisión es en 3 días con el Dr. Vargas. Recuerda tomar los antibióticos como te indicaron. Si tienes algún síntoma inusual escríbenos de inmediato.' },
    ],
  },
];

// ─── Tickets (Soporte post-operatorio) ──────────────────────────

export const TICKETS: Ticket[] = [
  {
    id: 't-001', kind: 'ticket', name: 'Fernanda Ríos', handle: '+52 55 7744 2210',
    channel: 'whatsapp', column: 'open', priority: 'high',
    category: 'Post-operatorio', subject: 'Inflamación excesiva día 5 post rinoplastia',
    sla: 'vence en 2h', breached: false,
    lastSeen: 'hace 1h', avatarHue: 45, assignee: 'lupita',
    tags: ['post-op', 'rinoplastia', 'urgente'],
    messages: [
      { from: 'lead', t: '09:00', text: 'Hola, ya voy en el día 5 de mi rinoplastia y siento que la inflamación está peor que ayer. ¿Es normal?' },
      { from: 'ai',   t: '09:01', text: 'Hola Fernanda. El día 5–7 suele ser el pico de inflamación, especialmente al bajar el esteroide. ¿Tienes fiebre, enrojecimiento inusual o secreción? Si es solo inflamación sin esos síntomas, suele ser normal.' },
      { from: 'lead', t: '09:05', text: 'No tengo fiebre, solo hinchazón. Pero me preocupó.' },
      { type: 'handoff', t: '09:06', text: 'Escalado a Lupita Mora — Enfermería' },
      { from: 'human', t: '09:10', by: 'Lupita Mora', text: 'Hola Fernanda, soy Lupita del equipo de enfermería. La inflamación del día 5 es completamente normal. Sigue aplicando frío local 15 min cada 2h y duerme con la cabeza elevada. ¿Quieres que le avisemos a la Dra. Mondragón para que te llame?' },
    ],
  },
  {
    id: 't-002', kind: 'ticket', name: 'Luis Herrera', handle: '+52 55 9922 3344',
    channel: 'whatsapp', column: 'pending', priority: 'normal',
    category: 'Medicamentos', subject: 'Pregunta sobre dosis de antibiótico post-lipo',
    sla: 'vence en 6h',
    lastSeen: 'hace 3h', avatarHue: 160, assignee: 'sofia-ai',
    tags: ['medicamento', 'lipo'],
    messages: [
      { from: 'lead', t: '08:30', text: 'Hola, ¿el antibiótico (Ciprofloxacino) lo tomo con o sin alimentos? Mi médico no me lo indicó claramente' },
      { from: 'ai',   t: '08:30', text: 'Hola Luis. El Ciprofloxacino se puede tomar con o sin alimentos, aunque tomarlo con comida puede ayudar a reducir el malestar estomacal. Lo importante es tomarlo cada 12 horas y no saltarse dosis. ¿Cuándo fue tu cirugía?' },
      { from: 'lead', t: '08:32', text: 'Fue antier, tengo 2 días' },
      { from: 'ai',   t: '08:33', text: 'Perfecto. En esos primeros días es normal el malestar. Recuerda también tomar el omeprazol como protector gástrico si te lo recetaron. Si tienes dolor fuerte o fiebre >38°C, avísanos de inmediato.' },
    ],
  },
  {
    id: 't-003', kind: 'ticket', name: 'Carmen Aguilar', handle: '@carmen.ag',
    channel: 'web', column: 'new', priority: 'urgent',
    category: 'Cita / Urgencia', subject: 'Posible complicación faja muy apretada',
    sla: 'vence en 1h', breached: true,
    lastSeen: 'hace 20 min', avatarHue: 55, assignee: null,
    tags: ['urgente', 'post-op', 'abdominoplastia', 'sla-riesgo'],
    messages: [
      { from: 'lead', t: '10:20', text: 'Hola, me puse la faja y siento entumecimiento en la pierna izquierda desde hace 2 horas. ¿Es normal después de la abdominoplastia?' },
      { from: 'ai',   t: '10:20', text: 'Carmen, el entumecimiento prolongado en pierna después de abdominoplastia requiere evaluación inmediata. Por favor comunícate al número de urgencias de la clínica: +52 55 4500 8800 ext. 0. ¿Puedes llamar ahora?' },
      { from: 'lead', t: '10:22', text: 'Sí voy a llamar, ¿me pueden atender hoy?' },
    ],
  },
];

// ─── Equipo ──────────────────────────────────────────────────────

export const TEAM: TeamMember[] = [
  { id: 'admin',    name: 'Dr. Alejandro Ríos', email: 'drrros@bellaforma.mx',  role: 'admin',   avatarHue: 210, online: true },
  { id: 'lupita',   name: 'Lupita Mora',         email: 'lupita@bellaforma.mx', role: 'agent',   avatarHue: 330, online: true },
  { id: 'sofia-ai', name: 'Sofía IA',            email: 'ai@bellaforma.mx',     role: 'agent',   avatarHue: 250, online: true },
  { id: 'karen',    name: 'Karen Soto',           email: 'karen@bellaforma.mx',  role: 'manager', avatarHue: 90,  online: false },
  { id: 'pablo',    name: 'Pablo Reyes',          email: 'pablo@bellaforma.mx',  role: 'agent',   avatarHue: 45,  online: true },
];

// ─── Configuración inicial de brand (White Label) ────────────────

export const DEFAULT_BRAND = {
  brandName:       'Clínica Bella Forma',
  assistantName:   'Sofía',
  logoMonogram:    'BF',
  logoDataUrl:     null as string | null,
  primaryColor:    '#605BFF',
  tone:            'empático y profesional',
  autopilot:       true,
  systemPrompt:    `Eres {assistantName}, la asistente virtual de {brandName}, clínica de cirugía plástica y estética. Responde de forma {tone}. Califica leads, agenda citas de valoración, informa sobre procedimientos y genera links de pago para anticipos. Nunca des diagnósticos médicos. Siempre en español mexicano.`,
};

// ─── Conexiones de canales (initial state) ───────────────────────

export const DEFAULT_CONNECTIONS = {
  whatsapp:  { connected: true,  since: '15 ene 2026', verified: true,  phoneId: '573810229012847' },
  instagram: { connected: true,  since: '20 ene 2026', verified: true,  pageId: 'ig_page_123' },
  facebook:  { connected: false },
  web:       { connected: false },
};

// ─── Playbooks ───────────────────────────────────────────────────

export const PLAYBOOKS = [
  { id: 'pb-1', name: 'Bienvenida y Calificación',     trigger: 'Mensaje nuevo de lead',      uses: 1284, conv: 312, enabled: true,  desc: 'Saluda, pregunta necesidad, asigna score y columna en el pipeline.' },
  { id: 'pb-2', name: 'Cierre con Pago Stripe',        trigger: 'Lead en etapa "Propuesta"',  uses: 487,  conv: 201, enabled: true,  desc: 'Genera link de pago Stripe y confirma automáticamente cuando se procesa.' },
  { id: 'pb-3', name: 'Agendado de Cita (Calendar)',   trigger: 'Intent: "quiero cita"',      uses: 334,  conv: 180, enabled: true,  desc: 'Consulta disponibilidad en Google Calendar y confirma la reserva en el chat.' },
  { id: 'pb-4', name: 'Seguimiento Post-Venta',        trigger: 'Venta cerrada (24h después)',uses: 201,  conv: 88,  enabled: false, desc: 'Pide reseña de Google y ofrece producto complementario.' },
  { id: 'pb-5', name: 'Reactivación de Leads Fríos',  trigger: 'Sin actividad > 7 días',     uses: 512,  conv: 43,  enabled: false, desc: 'Retoma la conversación con un mensaje personalizado basado en el historial.' },
  { id: 'pb-6', name: 'Escalado a Humano (SLA)',       trigger: 'Ticket urgente sin asignar', uses: 98,   conv: 91,  enabled: true,  desc: 'Detecta tickets urgentes y notifica al agente disponible inmediatamente.' },
];

// ─── Analytics (KPIs) ────────────────────────────────────────────

export const ANALYTICS_KPIs = {
  leads:       { value: 284,      delta: '+18%',  label: 'Leads totales',        up: true },
  qualified:   { value: 142,      delta: '+24%',  label: 'Calificados por IA',   up: true },
  won:         { value: 61,       delta: '+12%',  label: 'Ventas cerradas',       up: true },
  revenue:     { value: 847430,   delta: '+31%',  label: 'Ingresos MXN',         up: true },
  response:    { value: '1.8s',   delta: '-0.4s', label: 'Tiempo de respuesta',  up: true },
  aiHandle:    { value: '78%',    delta: '+5pp',  label: 'Atendidos por IA',     up: true },
};

export const REVENUE_SERIES = [
  21200, 18900, 24100, 22800, 26400, 19700, 31200,
  28900, 33400, 29800, 35100, 38200, 41900, 44800,
];

export const FUNNEL = [
  { stage: 'Leads totales',      value: 284, pct: 100 },
  { stage: 'Calificados por IA', value: 142, pct: 50  },
  { stage: 'Propuesta enviada',  value: 89,  pct: 31  },
  { stage: 'Venta cerrada',      value: 61,  pct: 21  },
];

export const CHANNEL_MIX = [
  { ch: 'WhatsApp', pct: 52, color: '#25D366' },
  { ch: 'Instagram', pct: 24, color: '#E1306C' },
  { ch: 'Web',       pct: 14, color: '#71717a' },
  { ch: 'Facebook',  pct: 10, color: '#0084FF' },
];

// ─── Claude models ───────────────────────────────────────────────

export const CLAUDE_MODELS = [
  { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5', desc: 'Equilibrio calidad/costo — respuestas en chat', recommended: true },
  { id: 'claude-haiku-4-5',  label: 'Claude Haiku 4.5',  desc: 'Rápido y económico — clasificación y scoring' },
  { id: 'claude-opus-4',     label: 'Claude Opus 4',     desc: 'Máxima inteligencia — razonamiento de journeys' },
];
