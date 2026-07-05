import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/resend'

const ADMIN_EMAILS = [
  { email: 'jairo.romo@novotech.mx', name: 'Jairo Romo' },
  { email: 'contacto@novotech.mx', name: 'Contacto Novotech' },
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.toLowerCase().trim() })

    if (error) {
      if (error.code === '23505') {
        // Duplicate — still success from UX perspective
        return NextResponse.json({ ok: true, message: 'Ya estás suscrito' })
      }
      throw error
    }

    sendEmail({
      to: ADMIN_EMAILS,
      subject: `Newsletter: nuevo suscriptor — ${email}`,
      htmlContent: `<p>Nuevo suscriptor al newsletter:</p><ul><li><b>Email:</b> ${email}</li><li><b>Fecha:</b> ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</li></ul>`,
    }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
