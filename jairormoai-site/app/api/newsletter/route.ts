import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/resend'

const ADMIN_EMAILS = [
  { email: 'jairo.romo@novotech.mx', name: 'Jairo Romo' },
  { email: 'contacto@novotech.mx', name: 'Contacto Novotech' },
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Segmento de Resend "Newsletter — IA al día, sin ruido". Configurable por
// env sin romper nada si no está seteada (usa este valor por default).
const RESEND_SEGMENT_ID = process.env.RESEND_NEWSLETTER_SEGMENT_ID || '9b1abd37-2a6f-4e9b-bb5b-a053ced1072a'

async function syncToResend(email: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  try {
    await fetch('https://api.resend.com/audiences/' + RESEND_SEGMENT_ID + '/contacts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    })
  } catch {
    // Best-effort: si Resend falla, el suscriptor ya quedó guardado en Supabase.
  }
}

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  try {
    const { email, consent } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400 })
    }

    if (consent !== true) {
      return NextResponse.json(
        { error: 'Debes aceptar el Aviso de Privacidad para suscribirte' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const normalizedEmail = email.toLowerCase().trim()

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: normalizedEmail })

    if (error) {
      if (error.code === '23505') {
        // Duplicate in Supabase — still sync to Resend in case that part
        // failed on a previous attempt, then report success either way.
        await syncToResend(normalizedEmail)
        return NextResponse.json({ ok: true, message: 'Ya estás suscrito' })
      }
      throw error
    }

    await syncToResend(normalizedEmail)

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
