import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/resend'

const ADMIN_EMAILS = [
  { email: 'jairo.romo@novotech.mx', name: 'Jairo Romo' },
  { email: 'contacto@novotech.mx', name: 'Contacto Novotech' },
]

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const courseSlug = session.metadata?.courseSlug
    const userId = session.metadata?.userId

    if (courseSlug && userId) {
      const supabase = createServiceClient()

      const { data: course } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', courseSlug)
        .single()

      if (course) {
        await supabase.from('enrollments').upsert({
          user_id: userId,
          course_id: course.id,
          stripe_session_id: session.id,
          progress: {},
        }, { onConflict: 'user_id,course_id' })
      }
    }

    const fecha = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
    const customerEmail = session.customer_details?.email ?? session.metadata?.userEmail ?? 'desconocido'
    const monto = session.amount_total ? `$${(session.amount_total / 100).toFixed(2)} ${(session.currency ?? 'usd').toUpperCase()}` : 'desconocido'
    const producto = session.metadata?.courseSlug ?? session.metadata?.productName ?? 'producto'
    sendEmail({
      to: ADMIN_EMAILS,
      subject: `💰 Compra: ${producto} — ${customerEmail}`,
      htmlContent: `<p>Nueva compra completada:</p><ul><li><b>Usuario:</b> ${customerEmail}</li><li><b>Producto:</b> ${producto}</li><li><b>Monto:</b> ${monto}</li><li><b>Fecha:</b> ${fecha}</li><li><b>Sesión Stripe:</b> ${session.id}</li></ul>`,
    }).catch(() => {})
  }

  return NextResponse.json({ received: true })
}
