import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CONTACT_RECIPIENT = 'jairo.romo@novotech.mx'

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

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

    const supabase = createServiceClient()
    const { error } = await supabase.from('contact_submissions').insert([form])
    if (error) throw error

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'jairoromo.ai <onboarding@resend.dev>',
        to: CONTACT_RECIPIENT,
        replyTo: form.email,
        subject: `Nuevo contacto desde jairoromo.ai — ${form.name}`,
        text: [
          `Nombre: ${form.name}`,
          `Email: ${form.email}`,
          `Empresa: ${form.company || '—'}`,
          `WhatsApp/Teléfono: ${form.whatsapp || '—'}`,
        ].join('\n'),
      })
    } else {
      console.warn('RESEND_API_KEY no configurada — omitiendo envío de correo de contacto')
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
