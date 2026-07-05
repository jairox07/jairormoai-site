import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ADMIN_EMAILS = [
  { email: 'jairo.romo@novotech.mx', name: 'Jairo Romo' },
  { email: 'contacto@novotech.mx', name: 'Contacto Novotech' },
]

export async function POST(request: Request) {
  try {
    const { name, email, company, whatsapp } = await request.json()

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    }
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const form = {
      name: name.trim(),
      email: email.trim(),
      company: typeof company === 'string' ? company.trim() : '',
      whatsapp: typeof whatsapp === 'string' ? whatsapp.trim() : '',
    }

    const fecha = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })

    const result = await sendEmail({
      to: ADMIN_EMAILS,
      subject: `Contacto: ${form.name} — ${form.email}`,
      htmlContent: `<p>Nuevo mensaje desde el formulario "Hablemos" de jairoromo.ai:</p><ul><li><b>Nombre:</b> ${form.name}</li><li><b>Email:</b> <a href="mailto:${form.email}">${form.email}</a></li><li><b>Empresa:</b> ${form.company || '—'}</li><li><b>WhatsApp/Teléfono:</b> ${form.whatsapp || '—'}</li><li><b>Fecha:</b> ${fecha}</li></ul>`,
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
