import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'

const ADMIN_EMAILS = [
  { email: 'jairo.romo@novotech.mx', name: 'Jairo Romo' },
  { email: 'contacto@novotech.mx', name: 'Contacto Novotech' },
]

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  try {
    const { event_type, metadata } = await request.json()
    if (!event_type) return NextResponse.json({ error: 'Missing event_type' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const service = getServiceClient()
    await service.from('activity_log').insert({
      user_id: user?.id ?? null,
      event_type,
      metadata: metadata || {},
    })

    if (event_type === 'skill_download' || event_type === 'download') {
      const fecha = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
      const userEmail = user?.email ?? 'desconocido'
      const item = metadata?.title ?? metadata?.file ?? metadata?.slug ?? 'sin nombre'
      sendEmail({
        to: ADMIN_EMAILS,
        subject: `Descarga: ${item} — ${userEmail}`,
        htmlContent: `<p>Un usuario descargó un recurso:</p><ul><li><b>Usuario:</b> ${userEmail}</li><li><b>Recurso:</b> ${item}</li><li><b>Fecha:</b> ${fecha}</li></ul>`,
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
