import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'
import { getAgentBySlug } from '@/lib/agents-data'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ADMIN_EMAILS = [
  { email: 'contacto@novotech.mx', name: 'Contacto Novotech' },
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      fullName,
      role,
      companyName,
      industry,
      teamSize,
      phone,
      email,
      agentSlug,
      processDescription,
    } = body

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    }
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }
    if (!phone || typeof phone !== 'string' || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      return NextResponse.json({ error: 'Teléfono debe tener 10 dígitos' }, { status: 400 })
    }
    if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
      return NextResponse.json({ error: 'Empresa requerida' }, { status: 400 })
    }

    const agent = getAgentBySlug(agentSlug)
    const fecha = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })

    const result = await sendEmail({
      to: ADMIN_EMAILS,
      subject: `Nueva solicitud de Agente IA: ${companyName} — ${agent?.name || agentSlug}`,
      htmlContent: `
        <h2>Nueva solicitud de implementación — Automatizaciones y Agentes</h2>
        <ul>
          <li><b>Agente de interés:</b> ${agent?.name || agentSlug}</li>
          <li><b>Nombre:</b> ${fullName}</li>
          <li><b>Cargo:</b> ${role || '—'}</li>
          <li><b>Empresa:</b> ${companyName}</li>
          <li><b>Industria:</b> ${industry || '—'}</li>
          <li><b>Número de empleados:</b> ${teamSize || '—'}</li>
          <li><b>WhatsApp:</b> ${phone}</li>
          <li><b>Email:</b> <a href="mailto:${email}">${email}</a></li>
          <li><b>Proceso actual:</b> ${processDescription || '—'}</li>
          <li><b>Fecha:</b> ${fecha}</li>
        </ul>
      `,
    })

    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
